import { config } from '../config/index.js';

export class ChatService {
  /**
   * Main entry point for generating chat responses.
   * Prioritizes Groq API, then Gemini, then built-in conversational rule engine.
   * All responses are kept to a simple response size with 2 to 3 normal-sized sentences.
   */
  static async replyToMessage({ message = '', history = [], language = 'English' }) {
    // 1. Groq LLM integration
    if (config.groqApiKey) {
      try {
        const groqReply = await this.invokeGroqChat({ message, history, language });
        if (groqReply) {
          return this.formatSimpleResponse(groqReply);
        }
      } catch (err) {
        console.warn('Groq chat call failed, falling back:', err.message);
      }
    }

    // 2. Gemini fallback
    if (config.geminiApiKey) {
      try {
        const geminiReply = await this.invokeGeminiChat({ message, history, language });
        if (geminiReply) {
          return this.formatSimpleResponse(geminiReply);
        }
      } catch (err) {
        console.warn('External Gemini chat call failed, falling back to rule engine:', err.message);
      }
    }

    // 3. Built-in conversational fallback
    return this.formatSimpleResponse(this.replyConversationalRuleEngine({ message, history, language }));
  }

  /**
   * Groq AI integration providing simple responses in natural, normal-sized sentences.
   */
  static async invokeGroqChat({ message, history = [], language = 'English' }) {
    const modelsToTry = [
      config.groqModel || 'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b'
    ];

    const systemPrompt = `You are MindCare AI, a supportive and helpful assistant for the MindPluze Predictive Stress & Crisis Support platform (associated with National Helpline 14566).

CRITICAL RESPONSE SIZE & STYLE GUIDELINES:
1. RESPONSE SIZE: Keep your total response simple, compact, and easy to read (strictly 2 to 3 normal-sized sentences, around 35 to 60 words total).
2. SENTENCE STRUCTURE: Use natural, normal-sized sentences (around 12 to 20 words each). Never use overly long run-on sentences, and do not use awkward single-clause sentence fragments.
3. TONE & VOCABULARY: Use clear, warm, and everyday language. Explain things simply without technical jargon, complex academic terms, or fluff.
4. FORMATTING: Write in a clean paragraph. Do NOT use bullet points, numbered lists, asterisks, markdown headers, or long preambles.
5. CRISIS & SAFETY: If the user indicates extreme distress, crisis, or danger, provide emergency support numbers (NHAA 14566, Police 112, AASRA 9820466726) directly in 2 to 3 clear sentences.
${language && language !== 'English' ? `Reply in simple, natural ${language}.` : ''}`.trim();

    // Map conversation history (keep last 6 turns for rapid, accurate context)
    const formattedHistory = Array.isArray(history)
      ? history
          .filter(m => m && m.content && typeof m.content === 'string')
          .slice(-6)
          .map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
            max_tokens: 160
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Groq API model ${model} responded with ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return content;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Groq chat attempt with model ${model} failed:`, err.message);
      }
    }

    if (lastError) throw lastError;
    return null;
  }

  /**
   * Gemini chat invocation fallback
   */
  static async invokeGeminiChat({ message, history, language }) {
    const historyText = Array.isArray(history) && history.length
      ? history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
      : '';

    const prompt = `You are MindCare AI, a supportive assistant for the MindPluze Predictive Stress & Crisis Support platform (associated with National Helpline 14566).

CRITICAL RESPONSE SIZE & STYLE GUIDELINES:
1. RESPONSE SIZE: Keep your total response simple and compact (strictly 2 to 3 normal-sized sentences, around 35 to 60 words total).
2. SENTENCE STRUCTURE: Use natural, normal-sized sentences (around 12 to 20 words each). Do NOT write run-on sentences, and do not use awkward sentence fragments.
3. TONE & VOCABULARY: Use clear, warm, and everyday language without technical jargon or fluff.
4. FORMATTING: Write in a clean paragraph. Do NOT use bullet points, numbered lists, asterisks, or markdown headers.
5. CRISIS & SAFETY: If the user indicates extreme distress, crisis, or danger, provide emergency support numbers (NHAA 14566, Police 112, AASRA 9820466726) directly in 2 to 3 clear sentences.
${language ? `Reply in simple, natural ${language}.` : ''}

Conversation:
${historyText}
User: ${message}
Assistant:`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error(`Gemini Chat error: ${response.statusText}`);
    const json = await response.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  }

  /**
   * Formats chat output to ensure a simple response size with natural, normal-sized sentences.
   */
  static formatSimpleResponse(text) {
    if (!text || typeof text !== 'string') return '';

    // Strip markdown formatting headers, bullets, numbers, and decorations
    let cleaned = text
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*•]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .trim();

    // Normalize linebreaks and extra spaces
    cleaned = cleaned.replace(/\r?\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();

    // Strip conversational preambles ending in colons or introductory filler
    cleaned = cleaned
      .replace(/^(?:sure|certainly|hello|hi|yes|of course|here(?:'s| is)[^:.]*[:.]\s*)/i, '')
      .trim();

    // Split into sentences using punctuation boundaries (. ! ?)
    const sentenceRegex = /[^.!?]+[.!?]+["']?|[^.!?]+$/g;
    const rawSentences = cleaned.match(sentenceRegex) || [cleaned];

    const sentences = rawSentences
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) return '';

    // Keep the first 2 to 3 normal-sized sentences for a simple, readable response size
    const selectedSentences = sentences.slice(0, 3);
    let result = selectedSentences.join(' ');

    // Ensure proper terminal punctuation
    if (!/[.!?]$/.test(result)) {
      result += '.';
    }

    return result;
  }

  /**
   * Backward-compatible alias for formatSimpleResponse
   */
  static formatToMaxTwoLines(text) {
    return this.formatSimpleResponse(text);
  }

  /**
   * Offline / rule-based fallback responses (all simple and 1–2 lines)
   */
  static replyConversationalRuleEngine({ message = '' }) {
    const msg = (message || '').toLowerCase().trim();

    if (msg.includes('suicide') || msg.includes('die') || msg.includes('kill myself') || msg.includes('end my life') || msg.includes('take my life')) {
      return "Your life matters. Please reach out right now to 24/7 helpline 14566, AASRA +91 9820466726, or Police 100/112.";
    }

    if (msg.includes('attack') || msg.includes('hit') || msg.includes('beat') || msg.includes('violence') || msg.includes('danger') || msg.includes('emergency')) {
      return "If you are in danger, please get to a safe place and call Police 100/112 or Helpline 14566 immediately.";
    }

    if (msg.includes('boycott') || msg.includes('caste') || msg.includes('threat') || msg.includes('water') || msg.includes('well') || msg.includes('shunned') || msg.includes('atrocity')) {
      return "Discrimination and boycotts are illegal under the SC/ST Act. Call Helpline 14566 for fast legal protection.";
    }

    if (msg.includes('panic') || msg.includes('anxiety') || msg.includes('scared') || msg.includes('terrified') || msg.includes('cannot breathe') || msg.includes('overwhelmed') || msg.includes('stress')) {
      return "Take a slow, deep breath in for 4 seconds and out for 6. You are safe here—how can I help you right now?";
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg === 'namaste') {
      return "Hello! I am your AI assistant. How can I help you today?";
    }

    if (msg.includes('legal') || msg.includes('lawyer') || msg.includes('court') || msg.includes('fir') || msg.includes('complaint')) {
      return "Under the SC/ST Prevention of Atrocities Act, you have the right to free legal aid and immediate police support.";
    }

    return "I am here to help you with any questions or support you need. What can I do for you today?";
  }
}

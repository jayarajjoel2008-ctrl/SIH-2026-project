import { config } from '../config/index.js';

export class ChatService {
  static async replyToMessage({ message = '', history = [], language = 'English' }) {
    if (config.geminiApiKey) {
      try {
        const geminiReply = await this.invokeGeminiChat({ message, history, language });
        if (geminiReply) return geminiReply;
      } catch (err) {
        console.warn("External Gemini chat call failed, falling back to built-in conversational engine:", err.message);
      }
    }

    return this.replyConversationalRuleEngine({ message, history, language });
  }

  static replyConversationalRuleEngine({ message = '', history = [], language = 'English' }) {
    const msg = (message || '').toLowerCase().trim();

    // 1. Suicidal ideation or self-harm crisis
    if (msg.includes('suicide') || msg.includes('die') || msg.includes('kill myself') || msg.includes('end my life') || msg.includes('take my life')) {
      return "I hear your immense distress, and please remember that you do not have to carry this alone. Your life and safety matter. Please reach out right now to immediate emergency support:\n\n• National Helpline Against Atrocities (NHAA): 14566 (Toll-Free, 24/7)\n• AASRA Crisis Line: +91 9820466726\n• Tele-MANAS / Kiran Mental Health: 14416 / 1800-599-0019\n• Police Emergency: 100\n\nPlease connect with one of these hotlines immediately. There are compassionate people waiting to listen and stand with you.";
    }

    // 2. Physical violence, attack, imminent danger
    if (msg.includes('attack') || msg.includes('hit') || msg.includes('beat') || msg.includes('violence') || msg.includes('danger') || msg.includes('emergency')) {
      return "If you are in immediate physical danger, please seek safety first and contact emergency services without delay:\n\n• Police Emergency: 100 / 112\n• Ambulance / Medical: 108\n• NHAA 24/7 Helpline: 14566\n\nUnder the SC/ST Prevention of Atrocities Act, you are entitled to prompt police protection, immediate relief, and state legal aid.";
    }

    // 3. Social boycott, caste discrimination, village threats
    if (msg.includes('boycott') || msg.includes('caste') || msg.includes('threat') || msg.includes('water') || msg.includes('well') || msg.includes('shunned') || msg.includes('atrocity')) {
      return "Social boycotts and caste-based discrimination are illegal offenses with strict legal penalties. You have the right to dignified life, equal access, and protection.\n\nWe encourage you to submit a full assessment in our 'Assessment' tab so our team can escalate your case for legal aid and police intervention, or contact the NHAA helpline at 14566.";
    }

    // 4. Panic, anxiety, rapid breathing, panic attacks
    if (msg.includes('panic') || msg.includes('anxiety') || msg.includes('scared') || msg.includes('terrified') || msg.includes('cannot breathe') || msg.includes('overwhelmed') || msg.includes('stress')) {
      return "Take a slow, deep breath with me. Inhale slowly for 4 counts, hold for 4, and exhale gently for 6. You can visit our interactive 'Guided Breathing' section in the top menu anytime to calm your nervous system. You are safe here, and we will walk through this step by step. What is worrying you most right now?";
    }

    // 5. Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg === 'namaste') {
      return "Namaste and welcome to MindCare Support. I am your confidential AI support companion for the National Helpline Against Atrocities (NHAA 14566). How can I assist or support you today?";
    }

    // 6. Legal aid inquiries
    if (msg.includes('legal') || msg.includes('lawyer') || msg.includes('court') || msg.includes('fir') || msg.includes('complaint')) {
      return "Under the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, you are entitled to free legal aid, mandatory FIR registration, and financial relief schemes. Our dashboard coordinates with District Legal Services Authorities (DLSA) to assign legal advocates to your case.";
    }

    // 7. General supportive response
    return "Thank you for sharing that with me. I recognize how painful and exhausting this experience is. Our platform provides confidential psychological screening, legal counseling coordination, and rapid escalation to local nodal officers. You can also complete a full voice or text assessment on the Assessment page for structured support.";
  }

  static async invokeGeminiChat({ message, history, language }) {
    const historyText = Array.isArray(history) && history.length
      ? history.map(m => `${m.role === 'user' ? 'Complainant' : 'Assistant'}: ${m.content}`).join('\n')
      : '';

    const prompt = `You are MindCare AI, a compassionate, trauma-informed support assistant for the National Helpline Against Atrocities (NHAA 14566) in India, serving victims from Scheduled Castes and Scheduled Tribes facing caste-based discrimination and violence.
Guidelines:
- Be warm, non-judgmental, and calm.
- If the user expresses self-harm or danger, immediately provide 14566, 100, 108, AASRA 9820466726.
- Keep replies empathetic and helpful (2-4 sentences).
- Respond in ${language || 'English'}.

Conversation:
${historyText}
Complainant: ${message}
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
}

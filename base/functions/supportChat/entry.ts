import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { message, history, language } = body || {};
    if (!message || !message.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const historyText = Array.isArray(history) && history.length
      ? history.map(m => `${m.role === 'user' ? 'Complainant' : 'Assistant'}: ${m.content}`).join('\n')
      : '';

    const prompt = `You are MindCare AI, a compassionate, trauma-informed support assistant for the National Helpline Against Atrocities (NHAA 14566) in India, serving victims from Scheduled Castes and Scheduled Tribes facing caste-based atrocities.

Guidelines:
- Keep the response size simple, compact, and easy to read (strictly 2 to 3 normal-sized sentences, around 35 to 60 words total).
- Use natural, normal-sized sentences (around 12 to 20 words each) with plain everyday words.
- Do NOT use bullet points, numbered lists, asterisks, markdown headers, or overly long run-on sentences.
- You are NOT a substitute for professional help. Encourage professional support for serious distress.
- If the person expresses suicidal thoughts, self-harm, or immediate danger, share emergency numbers: NHAA 14566, Police 112, AASRA 9820466726.
- Respond in the same language as the user (${language || 'English'}), supporting major Indian languages and dialects.

Conversation so far:
${historyText}

Complainant: ${message}
Assistant:`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "gpt_5_mini"
    });

    return Response.json({ reply: typeof result === 'string' ? result : JSON.stringify(result) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
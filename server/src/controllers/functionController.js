import { AIAnalyzerService } from '../services/aiAnalyzerService.js';
import { ChatService } from '../services/chatService.js';

export class FunctionController {
  static async analyzeAssessment(req, res) {
    try {
      const payload = req.body || {};
      const { narrative } = payload;
      if (!narrative || !narrative.trim()) {
        return res.status(400).json({ error: 'Narrative text is required for clinical analysis' });
      }

      const result = await AIAnalyzerService.analyzeAssessment(payload);
      return res.json({ data: result });
    } catch (err) {
      console.error('analyzeAssessment error:', err);
      return res.status(500).json({ error: 'Analysis failed: ' + err.message });
    }
  }

  static async supportChat(req, res) {
    try {
      const payload = req.body || {};
      const { message } = payload;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const reply = await ChatService.replyToMessage(payload);
      return res.json({ data: { reply } });
    } catch (err) {
      console.error('supportChat error:', err);
      return res.status(500).json({ error: 'Chat failed: ' + err.message });
    }
  }

  static async invokeGeneric(req, res) {
    try {
      const { functionName } = req.params;
      const payload = req.body || {};

      if (functionName === 'analyzeAssessment') {
        return FunctionController.analyzeAssessment(req, res);
      }
      if (functionName === 'supportChat' || functionName === 'supportchat') {
        return FunctionController.supportChat(req, res);
      }

      return res.status(404).json({ error: `Function '${functionName}' not recognized` });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

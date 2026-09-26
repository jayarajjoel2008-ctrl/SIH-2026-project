import { TranscriptionService } from '../services/transcriptionService.js';
import { config } from '../config/index.js';

export class IntegrationController {
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({
        file_url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'File upload failed: ' + err.message });
    }
  }

  static async transcribeAudio(req, res) {
    try {
      const { audio_url, filename } = req.body || {};
      const result = await TranscriptionService.transcribeAudio({ audio_url, filename });
      return res.json(result);
    } catch (err) {
      console.error('Transcription error:', err);
      return res.status(500).json({ error: 'Audio transcription failed: ' + err.message });
    }
  }
}

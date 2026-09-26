import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';
import { IntegrationController } from '../controllers/integrationController.js';

const router = Router();

// Ensure uploads folder exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

router.post('/upload', upload.single('file'), IntegrationController.uploadFile);
router.post('/transcribe', IntegrationController.transcribeAudio);

export default router;

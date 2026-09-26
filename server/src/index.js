import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import authRoutes from './routes/auth.js';
import assessmentRoutes from './routes/assessments.js';
import functionRoutes from './routes/functions.js';
import integrationRoutes from './routes/integrations.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for frontend Vite dev server and production
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
app.use('/uploads', express.static(config.uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MindCare AI Backend Server',
    environment: config.nodeEnv,
    time: new Date().toISOString()
  });
});

// Primary API routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/integrations', integrationRoutes);

// Compatibility route aliases for Base44 SDK modules
app.use('/api/entities/Assessment', assessmentRoutes);
app.use('/api/entities/assessment', assessmentRoutes);

// Base44 Cloud Function invocation URL pattern compatibility
app.post('/api/apps/:appId/functions/:functionName', (req, res) => {
  req.url = `/${req.params.functionName}`;
  functionRoutes(req, res);
});

// 404 handler for unrecognized API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`  MindCare Backend Server running on port ${config.port}`);
  console.log(`  URL: http://localhost:${config.port}`);
  console.log(`  Health Check: http://localhost:${config.port}/api/health`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`=======================================================`);
});

export default app;

import { Router } from 'express';
import { FunctionController } from '../controllers/functionController.js';

const router = Router();

// Specialized endpoints
router.post('/analyzeAssessment', FunctionController.analyzeAssessment);
router.post('/supportChat', FunctionController.supportChat);

// Generic function invoker compatible with Base44 SDK `base44.functions.invoke(name, payload)`
router.post('/:functionName', FunctionController.invokeGeneric);

export default router;

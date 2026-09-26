import { Router } from 'express';
import { AssessmentController } from '../controllers/assessmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Stats summary for dashboard metrics
router.get('/stats/summary', AssessmentController.stats);

// Assessment CRUD
router.get('/', AssessmentController.list);
router.get('/:id', AssessmentController.getById);
router.post('/', AssessmentController.create);
router.put('/:id', AssessmentController.update);
router.patch('/:id', AssessmentController.update);
router.delete('/:id', AssessmentController.delete);

export default router;

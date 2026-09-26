import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/guest', AuthController.guest);
router.get('/me', authenticateToken, AuthController.me);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/logout', AuthController.logout);

export default router;

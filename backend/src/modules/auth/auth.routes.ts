import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation';
import {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
  getMe,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from './auth.controller';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);

// Password reset routes (public)
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), changePassword);
router.get('/me', authenticate, getMe);

export default router;

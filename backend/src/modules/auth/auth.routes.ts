import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.validation';
import {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
  getMe,
} from './auth.controller';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), changePassword);
router.get('/me', authenticate, getMe);

export default router;

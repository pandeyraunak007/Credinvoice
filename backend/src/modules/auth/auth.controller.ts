import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.validation';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input: RegisterInput = req.body;
  const result = await authService.register(input);

  return sendCreated(res, result, 'Registration successful');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input: LoginInput = req.body;
  const result = await authService.login(input);

  return sendSuccess(res, result, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);

  return sendSuccess(res, { tokens }, 'Token refreshed successfully');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  await authService.logout(req.user.userId);
  return sendSuccess(res, null, 'Logged out successfully');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const input: ChangePasswordInput = req.body;
  await authService.changePassword(
    req.user.userId,
    input.currentPassword,
    input.newPassword
  );

  return sendSuccess(res, null, 'Password changed successfully');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const profile = await authService.getProfile(req.user.userId);
  return sendSuccess(res, profile);
});

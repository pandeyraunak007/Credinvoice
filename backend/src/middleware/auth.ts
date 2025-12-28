import { Request, Response, NextFunction } from 'express';
import { UserType } from '@prisma/client';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { prisma } from '../config/database';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string };
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true },
    });

    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    if (user.status !== 'ACTIVE') {
      return sendUnauthorized(res, 'Account is not active');
    }

    req.user = {
      ...payload,
      id: payload.userId,
    };

    next();
  } catch (error) {
    return sendUnauthorized(res, 'Invalid or expired token');
  }
}

export function authorize(...allowedRoles: UserType[]) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return sendUnauthorized(res);
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return sendForbidden(res, 'You do not have permission to access this resource');
    }

    next();
  };
}

// Convenience middleware for specific roles
export const buyerOnly = authorize('BUYER');
export const sellerOnly = authorize('SELLER');
export const financierOnly = authorize('FINANCIER');
export const adminOnly = authorize('ADMIN');
export const buyerOrSeller = authorize('BUYER', 'SELLER');
export const anyAuthenticated = authorize('BUYER', 'SELLER', 'FINANCIER', 'ADMIN');

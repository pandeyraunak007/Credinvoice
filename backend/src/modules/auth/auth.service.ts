import { UserType } from '@prisma/client';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateTokenPair, verifyToken, getTokenExpiry, TokenPair } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.validation';
import { sendEmail, generatePasswordResetEmail } from '../../utils/email';

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: any; tokens: TokenPair }> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user and profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          userType: input.userType as UserType,
          status: 'ACTIVE', // For MVP, auto-activate. In production, might need email verification
        },
      });

      // Create role-specific profile
      switch (input.userType) {
        case 'BUYER':
          await tx.buyer.create({
            data: {
              userId: newUser.id,
              companyName: input.companyName,
            },
          });
          break;
        case 'SELLER':
          await tx.seller.create({
            data: {
              userId: newUser.id,
              companyName: input.companyName,
            },
          });
          break;
        case 'FINANCIER':
          await tx.financier.create({
            data: {
              userId: newUser.id,
              companyName: input.companyName,
            },
          });
          break;
      }

      return newUser;
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Store refresh token
    const expiry = getTokenExpiry(tokens.refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
      },
      tokens,
    };
  }

  async login(input: LoginInput): Promise<{ user: any; tokens: TokenPair }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check status
    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 403);
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Store refresh token (delete old ones first)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    const expiry = getTokenExpiry(tokens.refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Verify token
    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError('Refresh token not found', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expired', 401);
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      userType: storedToken.user.userType,
    });

    // Update refresh token
    const expiry = getTokenExpiry(tokens.refreshToken);
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async getProfile(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        buyer: true,
        seller: true,
        financier: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        buyer: true,
        seller: true,
        financier: true,
      },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${input.email}`);
      return;
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Get user name from profile
    const userName = user.buyer?.companyName || user.seller?.companyName || user.financier?.companyName;

    // Generate reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Send email
    const { html, text } = generatePasswordResetEmail(resetLink, userName);
    await sendEmail({
      to: user.email,
      subject: 'Reset Your CredInvoice Password',
      html,
      text,
    });

    console.log(`Password reset token generated for user: ${user.email}`);
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: input.token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    if (resetToken.used) {
      throw new AppError('This reset token has already been used', 400);
    }

    if (resetToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      throw new AppError('Reset token has expired. Please request a new one.', 400);
    }

    // Hash the new password
    const passwordHash = await hashPassword(input.password);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Invalidate all refresh tokens for security
      prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    console.log(`Password reset successful for user: ${resetToken.user.email}`);
  }

  async verifyResetToken(token: string): Promise<boolean> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }
}

export const authService = new AuthService();

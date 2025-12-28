import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { API_PREFIX } from './config/constants';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import kycRoutes from './modules/kyc/kyc.routes';
import invoiceRoutes from './modules/invoices/invoice.routes';
import discountRoutes from './modules/discounts/discount.routes';
import bidRoutes from './modules/bids/bid.routes';
import disbursementRoutes from './modules/disbursements/disbursement.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import adminRoutes from './modules/admin/admin.routes';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: env.frontendUrl,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/profile`, profileRoutes);
  app.use(`${API_PREFIX}/kyc`, kycRoutes);
  app.use(`${API_PREFIX}/invoices`, invoiceRoutes);
  app.use(`${API_PREFIX}/discounts`, discountRoutes);
  app.use(`${API_PREFIX}/bids`, bidRoutes);
  app.use(`${API_PREFIX}/disbursements`, disbursementRoutes);
  app.use(`${API_PREFIX}/notifications`, notificationRoutes);
  app.use(`${API_PREFIX}/admin`, adminRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

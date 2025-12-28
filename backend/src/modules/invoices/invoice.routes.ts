import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize, financierOnly } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createInvoiceSchema, updateInvoiceSchema } from './invoice.validation';
import {
  extractInvoice,
  createInvoice,
  getInvoice,
  listInvoices,
  updateInvoice,
  deleteInvoice,
  submitInvoice,
  acceptInvoice,
  openForBidding,
  getAvailableForBidding,
} from './invoice.controller';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../config/constants';

const router = Router();

// Configure multer for invoice file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/invoices');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and TIFF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// All routes require authentication
router.use(authenticate);

// AI Extraction endpoint
router.post(
  '/extract',
  authorize('BUYER', 'SELLER'),
  upload.single('invoice'),
  extractInvoice
);

// CRUD routes
router.post(
  '/',
  authorize('BUYER', 'SELLER'),
  upload.single('document'),
  validateBody(createInvoiceSchema),
  createInvoice
);

router.get('/', listInvoices);
router.get('/available', financierOnly, getAvailableForBidding);
router.get('/:invoiceId', getInvoice);

router.put(
  '/:invoiceId',
  authorize('BUYER', 'SELLER'),
  validateBody(updateInvoiceSchema),
  updateInvoice
);

router.delete('/:invoiceId', authorize('BUYER', 'SELLER'), deleteInvoice);

// Submit invoice
router.post('/:invoiceId/submit', authorize('BUYER', 'SELLER'), submitInvoice);

// Accept invoice
router.post('/:invoiceId/accept', authorize('BUYER', 'SELLER'), acceptInvoice);

// Open for bidding
router.post('/:invoiceId/open-for-bidding', authorize('BUYER', 'SELLER'), openForBidding);

export default router;

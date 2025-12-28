import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, adminOnly, buyerOrSeller, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { uploadKycDocumentSchema, reviewKycDocumentSchema } from './kyc.validation';
import {
  uploadDocument,
  getMyDocuments,
  getDocument,
  deleteDocument,
  getKycStatus,
  getPendingDocuments,
  reviewDocument,
} from './kyc.controller';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../config/constants';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/kyc');
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

// User routes (Buyer, Seller, Financier)
router.post(
  '/upload',
  authorize('BUYER', 'SELLER', 'FINANCIER'),
  upload.single('document'),
  validateBody(uploadKycDocumentSchema),
  uploadDocument
);

router.get('/documents', authorize('BUYER', 'SELLER', 'FINANCIER'), getMyDocuments);
router.get('/status', authorize('BUYER', 'SELLER', 'FINANCIER'), getKycStatus);
router.get('/documents/:documentId', getDocument);
router.delete('/documents/:documentId', authorize('BUYER', 'SELLER', 'FINANCIER'), deleteDocument);

// Admin routes
router.get('/admin/pending', adminOnly, getPendingDocuments);
router.post(
  '/admin/documents/:documentId/review',
  adminOnly,
  validateBody(reviewKycDocumentSchema),
  reviewDocument
);

export default router;

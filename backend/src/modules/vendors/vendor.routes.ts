import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import {
  addVendorSchema,
  updateVendorSchema,
  referVendorSchema,
} from './vendor.validation';
import {
  getMyVendors,
  getVendorDetail,
  addVendor,
  removeVendor,
  updateVendor,
  getAvailableVendors,
  referVendor,
} from './vendor.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my vendors list (with search/filter/pagination)
router.get('/', getMyVendors);

// Get available vendors to add (KYC approved, not already added)
router.get('/available', getAvailableVendors);

// Get vendor detail with transaction history
router.get('/:vendorId', getVendorDetail);

// Add vendor manually
router.post('/', validateBody(addVendorSchema), addVendor);

// Update vendor (status, notes)
router.patch('/:vendorId', validateBody(updateVendorSchema), updateVendor);

// Remove vendor (soft delete - set INACTIVE)
router.delete('/:vendorId', removeVendor);

// Referral routes
router.post('/refer', validateBody(referVendorSchema), referVendor);

export default router;

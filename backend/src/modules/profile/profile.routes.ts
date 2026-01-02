import { Router } from 'express';
import { authenticate, buyerOnly, sellerOnly, financierOnly } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import {
  updateBuyerProfileSchema,
  updateSellerProfileSchema,
  updateFinancierProfileSchema,
  addBankAccountSchema,
  updateBankAccountSchema,
} from './profile.validation';
import {
  getProfile,
  updateProfile,
  getBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount,
  getVerifiedSellers,
  getVerifiedBuyers,
  createSellerReferral,
  getMyReferrals,
} from './profile.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/', getProfile);

// Update profile - different validation based on user type
// We use a middleware to select the right schema
router.put('/', (req, res, next) => {
  const userType = req.user?.userType;

  let schema;
  switch (userType) {
    case 'BUYER':
      schema = updateBuyerProfileSchema;
      break;
    case 'SELLER':
      schema = updateSellerProfileSchema;
      break;
    case 'FINANCIER':
      schema = updateFinancierProfileSchema;
      break;
    default:
      schema = updateBuyerProfileSchema; // fallback
  }

  validateBody(schema)(req, res, next);
}, updateProfile);

// Bank account routes
router.get('/bank-accounts', getBankAccounts);
router.post('/bank-accounts', validateBody(addBankAccountSchema), addBankAccount);
router.put('/bank-accounts/:accountId', validateBody(updateBankAccountSchema), updateBankAccount);
router.delete('/bank-accounts/:accountId', deleteBankAccount);
router.post('/bank-accounts/:accountId/set-primary', setPrimaryBankAccount);

// Verified sellers routes (for buyer invoice creation)
router.get('/sellers', getVerifiedSellers);

// Verified buyers routes (for seller GST-backed financing)
router.get('/buyers', getVerifiedBuyers);

// Seller referral routes
router.get('/referrals', getMyReferrals);
router.post('/referrals', createSellerReferral);

export default router;

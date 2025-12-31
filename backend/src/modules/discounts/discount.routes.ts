import { Router } from 'express';
import { authenticate, buyerOnly, sellerOnly } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import {
  createDiscountOfferSchema,
  updateDiscountOfferSchema,
  respondDiscountOfferSchema,
  authorizePaymentSchema,
  selectFundingTypeSchema,
  reviseOfferSchema,
} from './discount.validation';
import {
  createDiscountOffer,
  getDiscountOffer,
  getSellerPendingOffers,
  getBuyerOffers,
  updateDiscountOffer,
  respondToOffer,
  cancelOffer,
  authorizePayment,
  selectFundingType,
  reviseOffer,
  checkExpiredOffers,
} from './discount.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Buyer routes
router.post('/', buyerOnly, validateBody(createDiscountOfferSchema), createDiscountOffer);
router.get('/my-offers', buyerOnly, getBuyerOffers);
router.put('/:offerId', buyerOnly, validateBody(updateDiscountOfferSchema), updateDiscountOffer);
router.post('/:offerId/cancel', buyerOnly, cancelOffer);
router.post(
  '/:offerId/authorize-payment',
  buyerOnly,
  validateBody(authorizePaymentSchema),
  authorizePayment
);
router.post(
  '/:offerId/select-funding-type',
  buyerOnly,
  validateBody(selectFundingTypeSchema),
  selectFundingType
);
router.post(
  '/:offerId/revise',
  buyerOnly,
  validateBody(reviseOfferSchema),
  reviseOffer
);

// Seller routes
router.get('/pending', sellerOnly, getSellerPendingOffers);
router.post(
  '/:offerId/respond',
  sellerOnly,
  validateBody(respondDiscountOfferSchema),
  respondToOffer
);

// Common routes
router.get('/:offerId', getDiscountOffer);

// Admin/cron route to check expired offers
router.post('/check-expired', checkExpiredOffers);

export default router;

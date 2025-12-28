import { Router } from 'express';
import { authenticate, buyerOnly, sellerOnly } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import {
  createDiscountOfferSchema,
  updateDiscountOfferSchema,
  respondDiscountOfferSchema,
  authorizePaymentSchema,
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

export default router;

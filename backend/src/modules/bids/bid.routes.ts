import { Router } from 'express';
import { authenticate, financierOnly, buyerOrSeller } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createBidSchema, updateBidSchema } from './bid.validation';
import {
  createBid,
  getBid,
  getInvoiceBids,
  getMyBids,
  updateBid,
  withdrawBid,
  acceptBid,
} from './bid.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Financier routes
router.post('/', financierOnly, validateBody(createBidSchema), createBid);
router.get('/my-bids', financierOnly, getMyBids);
router.put('/:bidId', financierOnly, validateBody(updateBidSchema), updateBid);
router.post('/:bidId/withdraw', financierOnly, withdrawBid);

// Get bids for invoice (buyer, seller, or financier with bid)
router.get('/invoice/:invoiceId', getInvoiceBids);

// Accept bid (buyer or seller)
router.post('/:bidId/accept', buyerOrSeller, acceptBid);

// Get single bid
router.get('/:bidId', getBid);

export default router;

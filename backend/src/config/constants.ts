export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const USER_TYPES = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  FINANCIER: 'FINANCIER',
  ADMIN: 'ADMIN',
} as const;

export const KYC_STATUS = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_ACCEPTANCE: 'PENDING_ACCEPTANCE',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  OPEN_FOR_BIDDING: 'OPEN_FOR_BIDDING',
  BID_SELECTED: 'BID_SELECTED',
  DISBURSED: 'DISBURSED',
  SETTLED: 'SETTLED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED',
} as const;

export const PRODUCT_TYPES = {
  DYNAMIC_DISCOUNTING: 'DYNAMIC_DISCOUNTING',
  DD_EARLY_PAYMENT: 'DD_EARLY_PAYMENT',
  GST_BACKED: 'GST_BACKED',
} as const;

export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

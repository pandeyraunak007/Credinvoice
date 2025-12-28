import { z } from 'zod';

// GST and PAN regex patterns
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;

// Base profile fields
const baseProfileFields = {
  companyName: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  gstin: z.string().regex(gstinRegex, 'Invalid GSTIN format').optional().nullable(),
  pan: z.string().regex(panRegex, 'Invalid PAN format').optional().nullable(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional().nullable(),
  city: z.string().min(2, 'City must be at least 2 characters').optional().nullable(),
  state: z.string().min(2, 'State must be at least 2 characters').optional().nullable(),
  pincode: z.string().regex(pincodeRegex, 'Invalid pincode').optional().nullable(),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters').optional().nullable(),
  contactPhone: z.string().regex(phoneRegex, 'Invalid phone number').optional().nullable(),
};

// Buyer profile update schema
export const updateBuyerProfileSchema = z.object({
  ...baseProfileFields,
  industry: z.string().min(2, 'Industry must be at least 2 characters').optional().nullable(),
});

// Seller profile update schema
export const updateSellerProfileSchema = z.object({
  ...baseProfileFields,
  businessType: z.string().min(2, 'Business type must be at least 2 characters').optional().nullable(),
});

// Financier profile update schema
export const updateFinancierProfileSchema = z.object({
  ...baseProfileFields,
  rbiLicense: z.string().optional().nullable(),
  entityType: z.enum(['BANK', 'NBFC', 'OTHER']).optional().nullable(),
});

// Bank account schema
export const addBankAccountSchema = z.object({
  accountNo: z.string().min(9, 'Account number must be at least 9 digits').max(18, 'Account number too long'),
  ifscCode: z.string().regex(ifscRegex, 'Invalid IFSC code'),
  bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
  branchName: z.string().min(2, 'Branch name must be at least 2 characters').optional(),
  accountType: z.enum(['SAVINGS', 'CURRENT']).optional(),
  isPrimary: z.boolean().optional().default(false),
});

export const updateBankAccountSchema = z.object({
  bankName: z.string().min(2, 'Bank name must be at least 2 characters').optional(),
  branchName: z.string().min(2, 'Branch name must be at least 2 characters').optional(),
  accountType: z.enum(['SAVINGS', 'CURRENT']).optional(),
  isPrimary: z.boolean().optional(),
});

// Type exports
export type UpdateBuyerProfileInput = z.infer<typeof updateBuyerProfileSchema>;
export type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;
export type UpdateFinancierProfileInput = z.infer<typeof updateFinancierProfileSchema>;
export type AddBankAccountInput = z.infer<typeof addBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;

import { z } from 'zod';

// Add vendor manually
export const addVendorSchema = z.object({
  vendorId: z.string().uuid('Invalid vendor ID'),
  vendorType: z.enum(['BUYER', 'SELLER']),
  notes: z.string().optional(),
});

// Update vendor
export const updateVendorSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
});

// List vendors query
export const listVendorsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).default('ACTIVE'),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

// Referral schema (for non-existent vendors)
export const referVendorSchema = z.object({
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(1, 'Company name is required'),
  gstin: z.string().optional(),
  contactPhone: z.string().optional(),
  vendorType: z.enum(['BUYER', 'SELLER']),
});

// Type exports
export type AddVendorInput = z.infer<typeof addVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>;
export type ReferVendorInput = z.infer<typeof referVendorSchema>;

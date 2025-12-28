import { z } from 'zod';

export const uploadKycDocumentSchema = z.object({
  documentType: z.enum([
    'PAN_CARD',
    'GST_CERTIFICATE',
    'INCORPORATION_CERTIFICATE',
    'BANK_STATEMENT',
    'ADDRESS_PROOF',
    'DIRECTOR_ID',
    'RBI_LICENSE',
    'CANCELLED_CHEQUE',
    'OTHER',
  ], {
    errorMap: () => ({ message: 'Invalid document type' }),
  }),
});

export const reviewKycDocumentSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' }),
  }),
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters').optional(),
}).refine(
  (data) => {
    if (data.status === 'REJECTED' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  { message: 'Rejection reason is required when rejecting a document', path: ['rejectionReason'] }
);

export const listKycDocumentsQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  entityType: z.enum(['BUYER', 'SELLER', 'FINANCIER']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type UploadKycDocumentInput = z.infer<typeof uploadKycDocumentSchema>;
export type ReviewKycDocumentInput = z.infer<typeof reviewKycDocumentSchema>;
export type ListKycDocumentsQuery = z.infer<typeof listKycDocumentsQuerySchema>;

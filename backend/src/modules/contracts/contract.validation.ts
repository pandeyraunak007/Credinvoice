import { z } from 'zod';

export const listContractsQuerySchema = z.object({
  contractType: z.enum(['TWO_PARTY', 'THREE_PARTY']).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type ListContractsQuery = z.infer<typeof listContractsQuerySchema>;

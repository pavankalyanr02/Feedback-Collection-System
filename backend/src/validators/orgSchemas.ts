import { z } from 'zod';

export const createOrgSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
    logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'MANAGER', 'MEMBER', 'RESPONDENT']).default('MEMBER'),
  }),
});

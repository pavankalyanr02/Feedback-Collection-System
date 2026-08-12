import { z } from 'zod';

const QuestionTypeEnum = z.enum([
  'SHORT_TEXT',
  'LONG_TEXT',
  'MULTIPLE_CHOICE',
  'SINGLE_CHOICE',
  'RATING',
  'STAR_RATING',
  'YES_NO',
  'DROPDOWN',
  'NUMBER',
  'DATE',
]);

const QuestionOptionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Option label is required'),
  value: z.string().min(1, 'Option value is required'),
  orderIndex: z.number().int().default(0),
});

export const QuestionSchema = z.object({
  id: z.string().optional(),
  type: QuestionTypeEnum,
  title: z.string().min(1, 'Question title is required'),
  description: z.string().optional().nullable(),
  isRequired: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
  validation: z.string().optional().nullable(),
  options: z.array(QuestionOptionSchema).optional(),
});

export const createFormSchema = z.object({
  body: z.object({
    organizationId: z.string().uuid('Invalid organization ID'),
    title: z.string().min(2, 'Form title must be at least 2 characters'),
    description: z.string().optional().nullable(),
    allowAnonymous: z.boolean().default(true),
    requireAuth: z.boolean().default(false),
    onePerUser: z.boolean().default(false),
    expiresAt: z.string().datetime({ offset: true }).optional().nullable(),
    questions: z.array(QuestionSchema).optional(),
  }),
});

export const updateFormSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
    allowAnonymous: z.boolean().optional(),
    requireAuth: z.boolean().optional(),
    onePerUser: z.boolean().optional(),
    expiresAt: z.string().datetime({ offset: true }).optional().nullable(),
    questions: z.array(QuestionSchema).optional(),
  }),
});

export const submitResponseSchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z.string().min(1, 'Question ID is required'),
        value: z.string().min(1, 'Answer value is required'),
      })
    ),
    isAnonymous: z.boolean().default(true),
  }),
});

export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER' | 'RESPONDENT';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export type QuestionType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
  | 'SINGLE_CHOICE'
  | 'RATING'
  | 'STAR_RATING'
  | 'YES_NO'
  | 'DROPDOWN'
  | 'NUMBER'
  | 'DATE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  role?: Role;
  memberCount?: number;
  formCount?: number;
}

export interface QuestionOption {
  id?: string;
  label: string;
  value: string;
  orderIndex: number;
}

export interface FormQuestion {
  id?: string;
  type: QuestionType;
  title: string;
  description?: string | null;
  isRequired: boolean;
  orderIndex: number;
  validation?: string | null;
  options?: QuestionOption[];
}

export interface FeedbackForm {
  id: string;
  organizationId: string;
  creatorId: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  publicId: string;
  allowAnonymous: boolean;
  requireAuth: boolean;
  onePerUser: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: Partial<User>;
  questions?: FormQuestion[];
  questionCount?: number;
  responseCount?: number;
}

export interface FeedbackAnswer {
  questionId: string;
  questionTitle?: string;
  type?: QuestionType;
  value: string;
}

export interface FeedbackResponseItem {
  id: string;
  submittedAt: string;
  isAnonymous: boolean;
  respondent?: Partial<User> | null;
  answers: FeedbackAnswer[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: any[];
}

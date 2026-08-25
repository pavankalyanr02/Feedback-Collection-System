import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

export interface FormQueryParams {
  organizationId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export class FormService {
  static async getForms(params: FormQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: params.organizationId,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    const [forms, total] = await Promise.all([
      prisma.feedbackForm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: {
            select: { questions: true, responses: true },
          },
        },
      }),
      prisma.feedbackForm.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      forms: forms.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        status: f.status,
        publicId: f.publicId,
        allowAnonymous: f.allowAnonymous,
        requireAuth: f.requireAuth,
        onePerUser: f.onePerUser,
        expiresAt: f.expiresAt,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        creator: f.creator,
        questionCount: f._count.questions,
        responseCount: f._count.responses,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getFormById(formId: string, orgId?: string) {
    const form = await prisma.feedbackForm.findUnique({
      where: { id: formId },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      throw AppError.notFound('Feedback form not found');
    }

    if (orgId && form.organizationId !== orgId) {
      throw AppError.forbidden('Access denied to this form');
    }

    return form;
  }

  static async getPublicFormByPublicId(publicId: string) {
    const form = await prisma.feedbackForm.findUnique({
      where: { publicId },
      include: {
        organization: {
          select: { id: true, name: true, logoUrl: true },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!form) {
      throw AppError.notFound('Public form not found');
    }

    if (form.status !== 'PUBLISHED') {
      throw AppError.badRequest('This feedback form is currently inactive or closed.');
    }

    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      throw AppError.badRequest('This feedback form has expired.');
    }

    return form;
  }

  static async createForm(
    creatorId: string,
    data: {
      organizationId: string;
      title: string;
      description?: string | null;
      allowAnonymous?: boolean;
      requireAuth?: boolean;
      onePerUser?: boolean;
      expiresAt?: string | null;
      questions?: any[];
    }
  ) {
    const form = await prisma.feedbackForm.create({
      data: {
        organizationId: data.organizationId,
        creatorId,
        title: data.title,
        description: data.description,
        allowAnonymous: data.allowAnonymous ?? true,
        requireAuth: data.requireAuth ?? false,
        onePerUser: data.onePerUser ?? false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status: 'DRAFT',
        ...(data.questions &&
          data.questions.length > 0 && {
            questions: {
              create: data.questions.map((q, idx) => ({
                type: q.type,
                title: q.title,
                description: q.description,
                isRequired: q.isRequired ?? false,
                orderIndex: q.orderIndex ?? idx,
                validation: q.validation ? JSON.stringify(q.validation) : null,
                ...(q.options &&
                  q.options.length > 0 && {
                    options: {
                      create: q.options.map((opt: any, optIdx: number) => ({
                        label: opt.label,
                        value: opt.value,
                        orderIndex: opt.orderIndex ?? optIdx,
                      })),
                    },
                  }),
              })),
            },
          }),
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    return form;
  }

  static async updateForm(
    formId: string,
    data: {
      title?: string;
      description?: string | null;
      status?: string;
      allowAnonymous?: boolean;
      requireAuth?: boolean;
      onePerUser?: boolean;
      expiresAt?: string | null;
      questions?: any[];
    },
    orgId?: string
  ) {
    const existing = await prisma.feedbackForm.findUnique({ where: { id: formId } });
    if (!existing) {
      throw AppError.notFound('Form not found');
    }

    if (orgId && existing.organizationId !== orgId) {
      throw AppError.forbidden('Access denied to this form');
    }

    // If questions are provided, handle replace/update batch
    if (data.questions !== undefined) {
      await prisma.questionOption.deleteMany({
        where: { question: { formId } },
      });
      await prisma.formQuestion.deleteMany({
        where: { formId },
      });
    }

    const updated = await prisma.feedbackForm.update({
      where: { id: formId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.allowAnonymous !== undefined && { allowAnonymous: data.allowAnonymous }),
        ...(data.requireAuth !== undefined && { requireAuth: data.requireAuth }),
        ...(data.onePerUser !== undefined && { onePerUser: data.onePerUser }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
        ...(data.questions &&
          data.questions.length > 0 && {
            questions: {
              create: data.questions.map((q, idx) => ({
                type: q.type,
                title: q.title,
                description: q.description,
                isRequired: q.isRequired ?? false,
                orderIndex: q.orderIndex ?? idx,
                validation: q.validation ? JSON.stringify(q.validation) : null,
                ...(q.options &&
                  q.options.length > 0 && {
                    options: {
                      create: q.options.map((opt: any, optIdx: number) => ({
                        label: opt.label,
                        value: opt.value,
                        orderIndex: opt.orderIndex ?? optIdx,
                      })),
                    },
                  }),
              })),
            },
          }),
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { options: { orderBy: { orderIndex: 'asc' } } },
        },
      },
    });

    return updated;
  }

  static async duplicateForm(formId: string, creatorId: string, orgId?: string) {
    const original = await this.getFormById(formId, orgId);

    const duplicated = await prisma.feedbackForm.create({
      data: {
        organizationId: original.organizationId,
        creatorId,
        title: `${original.title} (Copy)`,
        description: original.description,
        status: 'DRAFT',
        allowAnonymous: original.allowAnonymous,
        requireAuth: original.requireAuth,
        onePerUser: original.onePerUser,
        questions: {
          create: original.questions.map((q) => ({
            type: q.type,
            title: q.title,
            description: q.description,
            isRequired: q.isRequired,
            orderIndex: q.orderIndex,
            validation: q.validation,
            options: {
              create: q.options.map((opt) => ({
                label: opt.label,
                value: opt.value,
                orderIndex: opt.orderIndex,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    return duplicated;
  }

  static async deleteForm(formId: string, orgId?: string) {
    const existing = await prisma.feedbackForm.findUnique({ where: { id: formId } });
    if (!existing) {
      throw AppError.notFound('Form not found');
    }

    if (orgId && existing.organizationId !== orgId) {
      throw AppError.forbidden('Access denied to this form');
    }

    await prisma.feedbackForm.delete({ where: { id: formId } });
    return true;
  }
}

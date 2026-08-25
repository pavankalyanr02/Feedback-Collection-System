import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

export class ResponseService {
  static async submitResponse(
    publicId: string,
    answers: { questionId: string; value: string }[],
    options: {
      isAnonymous?: boolean;
      respondentId?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    const form = await prisma.feedbackForm.findUnique({
      where: { publicId },
      include: {
        questions: true,
      },
    });

    if (!form) {
      throw AppError.notFound('Form not found');
    }

    if (form.status !== 'PUBLISHED') {
      throw AppError.badRequest('Form is not open for responses');
    }

    if (form.requireAuth && !options.respondentId) {
      throw AppError.unauthorized('Authentication is required to submit feedback to this form');
    }

    if (form.onePerUser && options.respondentId) {
      const existing = await prisma.feedbackResponse.findFirst({
        where: {
          formId: form.id,
          respondentId: options.respondentId,
        },
      });
      if (existing) {
        throw AppError.conflict('You have already submitted feedback for this form');
      }
    }

    // Validate required questions
    const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));
    for (const q of form.questions) {
      if (q.isRequired) {
        const val = answerMap.get(q.id);
        if (!val || val.trim() === '') {
          throw AppError.badRequest(`Missing answer for required question: "${q.title}"`);
        }
      }
    }

    const response = await prisma.feedbackResponse.create({
      data: {
        formId: form.id,
        respondentId: form.allowAnonymous && options.isAnonymous ? null : options.respondentId,
        isAnonymous: form.allowAnonymous ? options.isAnonymous ?? true : false,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    return response;
  }

  static async getFormResponses(
    formId: string,
    params: { page?: number; limit?: number; search?: string },
    orgId?: string
  ) {
    const form = await prisma.feedbackForm.findUnique({ where: { id: formId } });
    if (!form) {
      throw AppError.notFound('Form not found');
    }

    if (orgId && form.organizationId !== orgId) {
      throw AppError.forbidden('Access denied to this form');
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const [responses, total] = await Promise.all([
      prisma.feedbackResponse.findMany({
        where: { formId },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          respondent: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          answers: {
            include: {
              question: {
                select: { id: true, title: true, type: true },
              },
            },
          },
        },
      }),
      prisma.feedbackResponse.count({ where: { formId } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      responses: responses.map((r) => ({
        id: r.id,
        submittedAt: r.submittedAt,
        isAnonymous: r.isAnonymous,
        respondent: r.isAnonymous ? null : r.respondent,
        answers: r.answers.map((a) => ({
          questionId: a.questionId,
          questionTitle: a.question.title,
          type: a.question.type,
          value: a.value,
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async deleteResponse(responseId: string, orgId?: string) {
    const existing = await prisma.feedbackResponse.findUnique({
      where: { id: responseId },
      include: { form: { select: { organizationId: true } } },
    });
    if (!existing) {
      throw AppError.notFound('Response not found');
    }

    if (orgId && existing.form.organizationId !== orgId) {
      throw AppError.forbidden('Access denied');
    }

    await prisma.feedbackResponse.delete({ where: { id: responseId } });
    return true;
  }
}

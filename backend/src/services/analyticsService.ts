import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

export class AnalyticsService {
  static async getDashboardOverview(organizationId: string) {
    const [totalForms, activeForms, totalResponses, recentResponses, formsList] = await Promise.all([
      prisma.feedbackForm.count({ where: { organizationId } }),
      prisma.feedbackForm.count({ where: { organizationId, status: 'PUBLISHED' } }),
      prisma.feedbackResponse.count({ where: { form: { organizationId } } }),
      prisma.feedbackResponse.findMany({
        where: { form: { organizationId } },
        take: 5,
        orderBy: { submittedAt: 'desc' },
        include: {
          form: { select: { id: true, title: true } },
          respondent: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.feedbackForm.findMany({
        where: { organizationId },
        select: {
          id: true,
          title: true,
          status: true,
          _count: { select: { responses: true } },
        },
        orderBy: { responses: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    // CSAT (Customer Satisfaction) calculation for overall average rating.
    // CSAT is strictly calculated on a 1–5 scale.
    // STAR_RATING (1-5) is included directly. RATING is included only if values are <= 5 (excluding 1-10 scales).
    const ratingAnswers = await prisma.feedbackAnswer.findMany({
      where: {
        question: {
          form: { organizationId },
          type: { in: ['RATING', 'STAR_RATING'] },
        },
      },
      select: {
        value: true,
        question: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    });

    const csatValues: number[] = [];

    ratingAnswers.forEach((a) => {
      const numVal = parseFloat(a.value);
      if (isNaN(numVal) || numVal <= 0) return;

      if (a.question.type === 'STAR_RATING') {
        // STAR_RATING is 1–5 scale. Clamp to max 5.
        csatValues.push(Math.min(5, Math.max(1, numVal)));
      } else if (a.question.type === 'RATING') {
        // RATING questions with values <= 5 belong to a 1–5 scale.
        // Ratings > 5 (e.g. 1–10 scale) are excluded to prevent scores > 5.0.
        if (numVal <= 5) {
          csatValues.push(numVal);
        }
      }
    });

    let avgRating = 0;
    if (csatValues.length > 0) {
      const sum = csatValues.reduce((acc, curr) => acc + curr, 0);
      avgRating = sum / csatValues.length;
    }
    // Strict safety clamp to 5.0 max
    avgRating = Math.min(5.0, Math.max(0, avgRating));

    // Rating distribution for 1-5 star bar chart
    const ratingCounts: Record<string, number> = {
      '1 Star': 0,
      '2 Stars': 0,
      '3 Stars': 0,
      '4 Stars': 0,
      '5 Stars': 0,
    };

    csatValues.forEach((scoreVal) => {
      const score = Math.round(scoreVal);
      if (score >= 1 && score <= 5) {
        ratingCounts[`${score} Star${score > 1 ? 's' : ''}`]++;
      }
    });

    const ratingDistribution = Object.entries(ratingCounts).map(([label, count]) => ({
      rating: label,
      count,
    }));

    return {
      summary: {
        totalForms,
        activeForms,
        totalResponses,
        averageRating: Number(avgRating.toFixed(1)),
      },
      topForms: formsList.map((f) => ({
        id: f.id,
        title: f.title,
        status: f.status,
        responseCount: f._count.responses,
      })),
      ratingDistribution,
      recentResponses: recentResponses.map((r) => ({
        id: r.id,
        formTitle: r.form.title,
        submittedAt: r.submittedAt,
        isAnonymous: r.isAnonymous,
        respondentName: r.isAnonymous
          ? 'Anonymous'
          : `${r.respondent?.firstName || ''} ${r.respondent?.lastName || ''}`.trim(),
      })),
    };
  }

  static async getFormAnalytics(formId: string, orgId?: string) {
    const form = await prisma.feedbackForm.findUnique({
      where: { id: formId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: { orderBy: { orderIndex: 'asc' } },
            answers: true,
          },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      throw AppError.notFound('Form not found');
    }

    if (orgId && form.organizationId !== orgId) {
      throw AppError.forbidden('Access denied to this form');
    }

    const totalResponses = form._count.responses;

    // Daily Response Trends (Last 7 days)
    const responses = await prisma.feedbackResponse.findMany({
      where: { formId },
      select: { submittedAt: true },
      orderBy: { submittedAt: 'asc' },
    });

    const trendMap: Record<string, number> = {};
    responses.forEach((r) => {
      const dateStr = r.submittedAt.toISOString().split('T')[0];
      trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
    });

    const dailyTrends = Object.entries(trendMap).map(([date, count]) => ({
      date,
      responses: count,
    }));

    // Question-by-Question Stats
    const questionStats = form.questions.map((q) => {
      const totalAnswers = q.answers.length;

      if (['RATING', 'STAR_RATING'].includes(q.type)) {
        const scores = q.answers
          .map((a) => parseFloat(a.value))
          .filter((v) => !isNaN(v));
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        
        const dist: Record<string, number> = {};
        scores.forEach((s) => {
          const key = s.toString();
          dist[key] = (dist[key] || 0) + 1;
        });

        return {
          questionId: q.id,
          title: q.title,
          type: q.type,
          totalAnswers,
          averageScore: Number(avg.toFixed(1)),
          distribution: Object.entries(dist).map(([score, count]) => ({ score, count })),
        };
      }

      if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'YES_NO'].includes(q.type)) {
        const optionCounts: Record<string, number> = {};
        q.answers.forEach((a) => {
          const val = a.value;
          optionCounts[val] = (optionCounts[val] || 0) + 1;
        });

        const optionStats = Object.entries(optionCounts).map(([value, count]) => ({
          option: value,
          count,
          percentage: totalAnswers > 0 ? Number(((count / totalAnswers) * 100).toFixed(1)) : 0,
        }));

        return {
          questionId: q.id,
          title: q.title,
          type: q.type,
          totalAnswers,
          optionStats,
        };
      }

      // Text / Date / Number questions
      return {
        questionId: q.id,
        title: q.title,
        type: q.type,
        totalAnswers,
        recentAnswers: q.answers.slice(-5).map((a) => a.value),
      };
    });

    return {
      formId: form.id,
      title: form.title,
      totalResponses,
      dailyTrends,
      questionStats,
    };
  }
}

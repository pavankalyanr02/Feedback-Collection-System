import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { sendSuccess } from '../utils/apiResponse';

export class AuditController {
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req.query.organizationId as string) || req.user?.organizationId!;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: { organizationId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { email: true, firstName: true, lastName: true } },
          },
        }),
        prisma.auditLog.count({ where: { organizationId } }),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return sendSuccess(res, logs, 'Audit logs retrieved', 200, {
        page,
        limit,
        total,
        totalPages,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      return sendSuccess(res, notifications, 'Notifications retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

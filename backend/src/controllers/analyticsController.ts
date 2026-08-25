import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { sendSuccess } from '../utils/apiResponse';

export class AnalyticsController {
  static async getDashboardOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req.query.organizationId as string) || req.user?.organizationId!;
      const overview = await AnalyticsService.getDashboardOverview(organizationId);
      return sendSuccess(res, overview, 'Dashboard metrics fetched successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async getFormAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const formId = req.params.id;
      const analytics = await AnalyticsService.getFormAnalytics(formId, req.user?.organizationId);
      return sendSuccess(res, analytics, 'Form analytics fetched successfully');
    } catch (error) {
      return next(error);
    }
  }
}

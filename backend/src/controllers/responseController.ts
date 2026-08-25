import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../services/responseService';
import { sendSuccess } from '../utils/apiResponse';

export class ResponseController {
  static async submitPublicResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const publicId = req.params.publicId;
      const { answers, isAnonymous } = req.body;
      const respondentId = req.user?.userId;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await ResponseService.submitResponse(publicId, answers, {
        isAnonymous,
        respondentId,
        ipAddress,
        userAgent,
      });

      return sendSuccess(res, result, 'Feedback response submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async getFormResponses(req: Request, res: Response, next: NextFunction) {
    try {
      const formId = req.params.id;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;

      const result = await ResponseService.getFormResponses(
        formId,
        { page, limit, search },
        req.user?.organizationId
      );
      return sendSuccess(res, result.responses, 'Responses fetched', 200, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteResponse(req: Request, res: Response, next: NextFunction) {
    try {
      await ResponseService.deleteResponse(req.params.responseId, req.user?.organizationId);
      return sendSuccess(res, null, 'Response deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

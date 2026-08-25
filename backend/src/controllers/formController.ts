import { Request, Response, NextFunction } from 'express';
import { FormService } from '../services/formService';
import { sendSuccess } from '../utils/apiResponse';

export class FormController {
  static async getForms(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req.query.organizationId as string) || req.user?.organizationId!;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await FormService.getForms({
        organizationId,
        page,
        limit,
        search,
        status,
      });

      return sendSuccess(
        res,
        result.forms,
        'Forms retrieved successfully',
        200,
        result.pagination
      );
    } catch (error) {
      return next(error);
    }
  }

  static async getFormById(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.getFormById(req.params.id, req.user?.organizationId);
      return sendSuccess(res, form, 'Form details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getPublicForm(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.getPublicFormByPublicId(req.params.publicId);
      return sendSuccess(res, form, 'Public form loaded');
    } catch (error) {
      return next(error);
    }
  }

  static async createForm(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.createForm(req.user!.userId, req.body);
      return sendSuccess(res, form, 'Form created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async updateForm(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.updateForm(req.params.id, req.body, req.user?.organizationId);
      return sendSuccess(res, form, 'Form updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async publishForm(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.updateForm(req.params.id, { status: 'PUBLISHED' }, req.user?.organizationId);
      return sendSuccess(res, form, 'Form published successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async duplicateForm(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.duplicateForm(req.params.id, req.user!.userId, req.user?.organizationId);
      return sendSuccess(res, form, 'Form duplicated successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteForm(req: Request, res: Response, next: NextFunction) {
    try {
      await FormService.deleteForm(req.params.id, req.user?.organizationId);
      return sendSuccess(res, null, 'Form deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

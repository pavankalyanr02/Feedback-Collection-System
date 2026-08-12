import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { sendSuccess } from '../utils/apiResponse';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      return next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken);
      return sendSuccess(res, result, 'Tokens refreshed successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      return sendSuccess(res, user, 'Profile fetched successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    return sendSuccess(res, null, 'Logout successful');
  }
}

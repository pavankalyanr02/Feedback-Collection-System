import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/db';

export function authorizeRoles(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('User not authenticated'));
    }

    const userId = req.user.userId;
    const organizationId =
      req.params.orgId ||
      req.body.organizationId ||
      (req.query.organizationId as string) ||
      req.user.organizationId;

    if (!organizationId) {
      // If no org specified, fallback to token role or user role check
      if (req.user.role && allowedRoles.includes(req.user.role)) {
        return next();
      }
      return next(AppError.forbidden('Organization context missing for RBAC validation'));
    }

    // Lookup organization membership role
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member) {
      return next(AppError.forbidden('You are not a member of this organization'));
    }

    if (!allowedRoles.includes(member.role)) {
      return next(
        AppError.forbidden(`Role '${member.role}' does not have permission for this resource`)
      );
    }

    // Attach role to request context
    req.user.role = member.role;
    req.user.organizationId = organizationId;

    return next();
  };
}

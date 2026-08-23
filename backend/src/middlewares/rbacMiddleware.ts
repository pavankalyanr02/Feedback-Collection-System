import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/db';

export function authorizeRoles(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(AppError.unauthorized('User not authenticated'));
      }

      const userId = req.user.userId;

      // Organization context should come from the authenticated user
      // or an explicit organization route parameter.
      const organizationId =
        req.params.orgId || req.user.organizationId;

      if (!organizationId) {
        return next(
          AppError.forbidden('Organization context missing for RBAC validation')
        );
      }

      // Verify that the authenticated user actually belongs
      // to the requested organization.
      const member = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
      });

      if (!member) {
        return next(
          AppError.forbidden('You are not a member of this organization')
        );
      }

      // Check the user's actual organization role.
      if (!allowedRoles.includes(member.role)) {
        return next(
          AppError.forbidden(
            `Role '${member.role}' does not have permission for this resource`
          )
        );
      }

      // Keep the verified organization and role in request context.
      req.user.organizationId = organizationId;
      req.user.role = member.role;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
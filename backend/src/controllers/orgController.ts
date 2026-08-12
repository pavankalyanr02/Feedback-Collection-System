import { Request, Response, NextFunction } from 'express';
import { OrgService } from '../services/orgService';
import { sendSuccess } from '../utils/apiResponse';

export class OrgController {
  static async listUserOrgs(req: Request, res: Response, next: NextFunction) {
    try {
      const orgs = await OrgService.getUserOrganizations(req.user!.userId);
      return sendSuccess(res, orgs, 'User organizations retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async createOrg(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, logoUrl } = req.body;
      const org = await OrgService.createOrganization(req.user!.userId, name, slug, logoUrl);
      return sendSuccess(res, org, 'Organization created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.params.orgId || req.user!.organizationId!;
      const members = await OrgService.getMembers(orgId);
      return sendSuccess(res, members, 'Organization members retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.params.orgId || req.user!.organizationId!;
      const { email, role } = req.body;
      const member = await OrgService.addMemberByEmail(orgId, email, role);
      return sendSuccess(res, member, 'Member added to organization', 201);
    } catch (error) {
      return next(error);
    }
  }
}

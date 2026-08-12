import { Router } from 'express';
import { OrgController } from '../controllers/orgController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createOrgSchema, addMemberSchema } from '../validators/orgSchemas';

const router = Router();

router.use(authenticate);

router.get('/', OrgController.listUserOrgs);
router.post('/', validateRequest(createOrgSchema), OrgController.createOrg);
router.get('/:orgId/members', authorizeRoles('ADMIN', 'MANAGER', 'MEMBER'), OrgController.listMembers);
router.post('/:orgId/members', authorizeRoles('ADMIN'), validateRequest(addMemberSchema), OrgController.addMember);

export default router;

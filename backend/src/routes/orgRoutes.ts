import { Router } from 'express';
import { OrgController } from '../controllers/orgController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createOrgSchema, addMemberSchema } from '../validators/orgSchemas';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/v1/orgs:
 *   get:
 *     summary: List all organizations the user belongs to
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created
 */
router.get('/', OrgController.listUserOrgs);
router.post('/', validateRequest(createOrgSchema), OrgController.createOrg);

/**
 * @openapi
 * /api/v1/orgs/{orgId}/members:
 *   get:
 *     summary: List organization members
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of members
 *   post:
 *     summary: Add member to organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, MEMBER]
 *     responses:
 *       200:
 *         description: Member added successfully
 */
router.get('/:orgId/members', authorizeRoles('ADMIN', 'MANAGER', 'MEMBER'), OrgController.listMembers);
router.post('/:orgId/members', authorizeRoles('ADMIN'), validateRequest(addMemberSchema), OrgController.addMember);

export default router;


import { Router } from 'express';
import { FormController } from '../controllers/formController';
import { ResponseController } from '../controllers/responseController';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createFormSchema, updateFormSchema } from '../validators/formSchemas';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/v1/forms:
 *   get:
 *     summary: Get all feedback forms for current user/organization
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of forms
 *   post:
 *     summary: Create a new feedback form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationId, title]
 *             properties:
 *               organizationId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Form created
 */
router.get(
  '/',
  authorizeRoles('ADMIN', 'MANAGER', 'MEMBER'),
  FormController.getForms
);

router.post(
  '/',
  authorizeRoles('ADMIN', 'MANAGER'),
  validateRequest(createFormSchema),
  FormController.createForm
);

/**
 * @openapi
 * /api/v1/forms/{id}:
 *   get:
 *     summary: Get feedback form by ID
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form details
 *   put:
 *     summary: Update feedback form by ID
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form updated
 *   delete:
 *     summary: Delete feedback form by ID
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form deleted
 */
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER', 'MEMBER'),
  FormController.getFormById
);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  validateRequest(updateFormSchema),
  FormController.updateForm
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  FormController.deleteForm
);

/**
 * @openapi
 * /api/v1/forms/{id}/publish:
 *   post:
 *     summary: Publish feedback form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form published
 */
router.post(
  '/:id/publish',
  authorizeRoles('ADMIN', 'MANAGER'),
  FormController.publishForm
);

/**
 * @openapi
 * /api/v1/forms/{id}/duplicate:
 *   post:
 *     summary: Duplicate existing feedback form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Form duplicated
 */
router.post(
  '/:id/duplicate',
  authorizeRoles('ADMIN', 'MANAGER'),
  FormController.duplicateForm
);

/**
 * @openapi
 * /api/v1/forms/{id}/responses:
 *   get:
 *     summary: Get all submitted responses for a form
 *     tags: [Form Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of responses
 */
router.get(
  '/:id/responses',
  authorizeRoles('ADMIN', 'MANAGER'),
  ResponseController.getFormResponses
);

/**
 * @openapi
 * /api/v1/forms/{id}/responses/{responseId}:
 *   delete:
 *     summary: Delete a specific form response
 *     tags: [Form Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response deleted
 */
router.delete(
  '/:id/responses/:responseId',
  authorizeRoles('ADMIN', 'MANAGER'),
  ResponseController.deleteResponse
);

/**
 * @openapi
 * /api/v1/forms/{id}/analytics:
 *   get:
 *     summary: Get analytics and breakdown for a form
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics summary
 */
router.get(
  '/:id/analytics',
  authorizeRoles('ADMIN', 'MANAGER'),
  AnalyticsController.getFormAnalytics
);

export default router;
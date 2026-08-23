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

// Forms
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

router.post(
  '/:id/publish',
  authorizeRoles('ADMIN', 'MANAGER'),
  FormController.publishForm
);

router.post(
  '/:id/duplicate',
  authorizeRoles('ADMIN', 'MANAGER'),
  FormController.duplicateForm
);

// Form Responses
router.get(
  '/:id/responses',
  authorizeRoles('ADMIN', 'MANAGER'),
  ResponseController.getFormResponses
);

router.delete(
  '/:id/responses/:responseId',
  authorizeRoles('ADMIN', 'MANAGER'),
  ResponseController.deleteResponse
);

// Form Analytics
router.get(
  '/:id/analytics',
  authorizeRoles('ADMIN', 'MANAGER'),
  AnalyticsController.getFormAnalytics
);

export default router;
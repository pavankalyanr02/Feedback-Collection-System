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

router.get('/', FormController.getForms);
router.post('/', validateRequest(createFormSchema), FormController.createForm);

router.get('/:id', FormController.getFormById);
router.put('/:id', validateRequest(updateFormSchema), FormController.updateForm);
router.delete('/:id', FormController.deleteForm);

router.post('/:id/publish', FormController.publishForm);
router.post('/:id/duplicate', FormController.duplicateForm);

// Form Responses & Analytics sub-routes
router.get('/:id/responses', ResponseController.getFormResponses);
router.delete('/:id/responses/:responseId', ResponseController.deleteResponse);
router.get('/:id/analytics', AnalyticsController.getFormAnalytics);

export default router;

import { Router } from 'express';
import { FormController } from '../controllers/formController';
import { ResponseController } from '../controllers/responseController';
import { optionalAuthenticate } from '../middlewares/authMiddleware';
import { publicSubmissionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validateRequest';
import { submitResponseSchema } from '../validators/formSchemas';

const router = Router();

router.get('/forms/:publicId', optionalAuthenticate, FormController.getPublicForm);
router.post(
  '/forms/:publicId/responses',
  publicSubmissionRateLimiter,
  optionalAuthenticate,
  validateRequest(submitResponseSchema),
  ResponseController.submitPublicResponse
);

export default router;

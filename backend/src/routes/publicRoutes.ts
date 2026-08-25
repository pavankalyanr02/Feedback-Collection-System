import { Router } from 'express';
import { FormController } from '../controllers/formController';
import { ResponseController } from '../controllers/responseController';
import { optionalAuthenticate } from '../middlewares/authMiddleware';
import { publicSubmissionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validateRequest';
import { submitResponseSchema } from '../validators/formSchemas';

const router = Router();

/**
 * @openapi
 * /api/v1/public/forms/{publicId}:
 *   get:
 *     summary: Fetch published form structure by public ID for respondents
 *     tags: [Public Submissions]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form structure for submission
 *       404:
 *         description: Form not found or closed
 */
router.get('/forms/:publicId', optionalAuthenticate, FormController.getPublicForm);

/**
 * @openapi
 * /api/v1/public/forms/{publicId}/responses:
 *   post:
 *     summary: Submit a response to a public feedback form
 *     tags: [Public Submissions]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [questionId, value]
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     value:
 *                       type: string
 *     responses:
 *       201:
 *         description: Response submitted successfully
 */
router.post(
  '/forms/:publicId/responses',
  publicSubmissionRateLimiter,
  optionalAuthenticate,
  validateRequest(submitResponseSchema),
  ResponseController.submitPublicResponse
);

export default router;


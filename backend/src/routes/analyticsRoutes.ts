import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Get workspace dashboard overview analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics and charts data and submissions overview
 */
router.get('/dashboard', AnalyticsController.getDashboardOverview);

export default router;


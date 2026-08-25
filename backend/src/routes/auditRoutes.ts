import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/v1/audit/logs:
 *   get:
 *     summary: Fetch system audit logs for organization activity
 *     tags: [Audit & Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get(
  '/logs',
  authorizeRoles('ADMIN'),
  AuditController.getAuditLogs
);

/**
 * @openapi
 * /api/v1/audit/notifications:
 *   get:
 *     summary: Fetch user notifications
 *     tags: [Audit & Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/notifications', AuditController.getNotifications);

export default router;
import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticate } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/rbacMiddleware';

const router = Router();

router.use(authenticate);

router.get(
  '/logs',
  authorizeRoles('ADMIN'),
  AuditController.getAuditLogs
);

router.get('/notifications', AuditController.getNotifications);

export default router;
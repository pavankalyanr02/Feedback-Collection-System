import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/logs', AuditController.getAuditLogs);
router.get('/notifications', AuditController.getNotifications);

export default router;

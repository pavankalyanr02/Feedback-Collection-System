import { Router } from 'express';
import authRoutes from './authRoutes';
import orgRoutes from './orgRoutes';
import formRoutes from './formRoutes';
import publicRoutes from './publicRoutes';
import analyticsRoutes from './analyticsRoutes';
import auditRoutes from './auditRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', orgRoutes);
router.use('/forms', formRoutes);
router.use('/public', publicRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit', auditRoutes);

export default router;

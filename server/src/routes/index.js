import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import interviewRoutes from './interview.routes.js';
import historyRoutes from './history.routes.js';
import userRoutes from './user.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/history', historyRoutes);
router.use('/user', userRoutes);

export default router;

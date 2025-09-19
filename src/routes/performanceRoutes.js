import express from 'express';
import {
  getStudentPerformance,
  getPerformanceAnalytics,
  getSubjectPerformance
} from '../controllers/performanceController.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Get comprehensive student performance data
router.get('/', getStudentPerformance);

// Get performance analytics for a specific time period
router.get('/analytics', getPerformanceAnalytics);

// Get subject-wise detailed performance
router.get('/subject/:subject', getSubjectPerformance);

export default router;

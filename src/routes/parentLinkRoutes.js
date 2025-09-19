import express from 'express';
import {
  generateLinkingCode,
  linkParentToStudent,
  getLinkedStudent,
  getLinkedParents,
  unlinkParentFromStudent,
  getStudentPerformanceForParent
} from '../controllers/parentLinkController.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Student routes
router.post('/generate-code', generateLinkingCode); // Student generates linking code
router.get('/parents', getLinkedParents); // Student gets linked parents

// Parent routes
router.post('/link-student', linkParentToStudent); // Parent links to student using code
router.get('/student', getLinkedStudent); // Parent gets linked student
router.delete('/unlink', unlinkParentFromStudent); // Parent unlinks from student
router.get('/student-performance', getStudentPerformanceForParent); // Parent gets student performance

export default router;

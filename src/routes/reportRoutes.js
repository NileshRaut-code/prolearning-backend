import express from 'express';
import {
  createReport,
  getReportsByStudent,
 
} from '../controllers/reportController.js';

const router = express.Router();

router.post('/', createReport);
router.get('/student/:studentId', getReportsByStudent);

export default router;

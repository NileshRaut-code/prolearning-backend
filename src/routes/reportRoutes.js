import express from 'express';
import {
  createReport,
  getallresultofstudent,
  getReportsByStudent,
 
} from '../controllers/reportController.js';

const router = express.Router();

router.post('/', createReport);
router.get('/studentss/:studentId', getReportsByStudent);
router.get('/s/:studentId', getallresultofstudent);


export default router;

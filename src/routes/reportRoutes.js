import express from 'express';
import {
  createReport,
  getallresultofstudent,
  getReportsByStudent,
 
} from '../controllers/reportController.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();

router.post('/', createReport);
router.get('/studentss/:studentId', getReportsByStudent);
//verifyJWT
router.get('/s/:studentId',verifyJWT, getallresultofstudent);


export default router;

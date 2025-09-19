import express from 'express';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  submitTestResult,
  getTestResults,
  getTestResultById
} from '../controllers/testController.js';
import { verifyTeacher } from '../middlewares/teacher.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();


router.get('/', getAllTests);
router.get('/:id', getTestById);

router.post('/',verifyJWT,verifyTeacher, createTest);
router.put('/:id',verifyJWT,verifyTeacher, updateTest);
router.delete('/:id',verifyJWT,verifyTeacher, deleteTest);
router.post('/:id/submit',verifyJWT, submitTestResult);  // To submit test results
router.get('/:id/results',verifyJWT, getTestResults);  // To get all results for a test
router.get('/results/:resultId',verifyJWT, getTestResultById);  // To get specific result

export default router;

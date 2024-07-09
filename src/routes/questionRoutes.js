import express from 'express';
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { verifyTeacher } from '../middlewares/teacher.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);

router.post('/',verifyJWT,verifyTeacher, createQuestion);
router.put('/:id',verifyJWT,verifyTeacher, updateQuestion);
router.delete('/:id',verifyJWT,verifyTeacher, deleteQuestion);

export default router;

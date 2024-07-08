import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { verifyTeacher } from '../middlewares/teacher.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();


router.get('/:id', getSubjectById);
router.get('/', getAllSubjects);

router.post('/',verifyJWT,verifyTeacher, createSubject);
router.put('/:id',verifyJWT,verifyTeacher, updateSubject);
router.delete('/:id',verifyJWT,verifyTeacher, deleteSubject);

export default router;

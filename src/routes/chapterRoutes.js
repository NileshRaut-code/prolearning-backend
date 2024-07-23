import express from 'express';
import {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  
} from '../controllers/chapterController.js';
import { createChapterTest,submitChapterTestResult,viewChapterTest,viewChapterTestbychapterid,viewChapterResultid,ViewalltestBystandard } from '../controllers/chapterTestController.js';
import { verifyTeacher } from '../middlewares/teacher.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();


router.get('/', getAllChapters);
router.get('/:id', getChapterById);

router.post('/',verifyJWT,verifyTeacher ,createChapter);
router.put('/:id',verifyJWT,verifyTeacher, updateChapter);
router.delete('/:id',verifyJWT,verifyTeacher, deleteChapter);
// chapter wise test 
router.post('/chapter-tests', verifyJWT, createChapterTest);
router.post('/chapter-tests/results', verifyJWT, submitChapterTestResult);
router.get('/chapter-tests/results/:id', verifyJWT, viewChapterResultid);

router.get('/chapter-tests/:id',verifyJWT, viewChapterTest);
router.get('/chapter-tests/chapter/:chapterId',verifyJWT, viewChapterTestbychapterid);
router.get('/chapter-tests/standard/:id',verifyJWT, ViewalltestBystandard);



export default router;

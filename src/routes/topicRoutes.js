import express from 'express';
import {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,linkTopics,
} from '../controllers/topicController.js';
import { verifyTeacher } from '../middlewares/teacher.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();


router.get('/', getAllTopics);
router.get('/:id',getTopicById);

router.post('/',verifyJWT,verifyTeacher,createTopic);
router.put('/:id',verifyJWT,verifyTeacher, updateTopic);
router.delete('/:id',verifyJWT,verifyTeacher, deleteTopic);
router.post('/relatedtopics/',verifyJWT,verifyTeacher,linkTopics );
export default router;

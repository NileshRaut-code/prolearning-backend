import express from 'express';
import {
  createStandard,
  getAllStandards,
  getStandardById,
  updateStandard,
  deleteStandard,
} from '../controllers/standardController.js';
import { verifyTeacher } from '../middlewares/teacher.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();

router.get('/', getAllStandards);
router.get('/:id', getStandardById);

router.post('/',verifyJWT,verifyTeacher, createStandard);
router.put('/:id',verifyJWT,verifyTeacher, updateStandard);
router.delete('/:id',verifyJWT,verifyTeacher, deleteStandard);

export default router;


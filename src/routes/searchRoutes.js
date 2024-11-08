import express from 'express';
import { searchTopics } from '../controllers/searchControllers.js';

const router = express.Router();
//verifyJWT,

router.get('/',searchTopics)
export default router;

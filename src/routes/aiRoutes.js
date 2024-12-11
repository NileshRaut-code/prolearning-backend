import express from 'express';
import { aigen,linktagging,chatbot } from '../controllers/aicontroller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();
//verifyJWT,
router.get('/', aigen);

router.get('/tagging', linktagging);
router.post('/chat-bot',chatbot)

export default router;

import express from 'express';
import { aigen,linktagging,chatbot } from '../controllers/aicontroller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();
//verifyJWT,
router.get('/', aigen);

router.get('/tagging', verifyJWT,linktagging);
router.post('/chat-bot',chatbot)
// router.post("/learning-plan", verifyJWT, createLearningPlan);


export default router;

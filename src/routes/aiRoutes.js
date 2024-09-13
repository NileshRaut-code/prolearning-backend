import express from 'express';
import { aigen } from '../controllers/aicontroller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = express.Router();

router.get('/',verifyJWT, aigen);


export default router;

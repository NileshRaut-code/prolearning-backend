import express from 'express';

import multer from 'multer';
import { uploadsingle } from '../controllers/uploadController.js';
const router = express.Router();
const upload =multer()

router.post('/single',upload.any("image", 1),uploadsingle);
router.get('/single',(req,res)=>res.send("hellow"))

export default router;

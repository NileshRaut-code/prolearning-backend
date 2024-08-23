import express from 'express';
import { createPhysicalTest,getPhysicalTestById,getPhysicalTests,getAllChaptersbystd,ViewalltestBystandard,ViewalltestBysubject ,createPhysicalTestfromlistquestion} from '../controllers/physicalTestController.js';
import { submitAnswerCopy,gradeAnswerCopy,getAnswerCopy, getAllAnswerCopy, getAllAnswerCopysubjectwise, getAllbyteacher, getAnswerCopyResult,alreadycheck } from '../controllers/physicalAnswerController.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

import multer from "multer";


const router = express.Router();
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })

const upload = multer();

router.post("/physical-tests", verifyJWT, createPhysicalTest);
router.post("/physical-tests/autogenrated", verifyJWT, createPhysicalTestfromlistquestion);

router.get("/physical-tests", verifyJWT, getPhysicalTests);
// router.get("/physical-tests/:std", verifyJWT, getAllChaptersbystd);
router.get('/physical-tests/standard/:id',verifyJWT, ViewalltestBystandard);
router.get('/physical-tests/standard/:standard/:subject',verifyJWT, ViewalltestBysubject);
router.get("/physical-tests/:testId", verifyJWT, getPhysicalTestById);

// Routes for physical answer copies
router.post("/answer-copies", verifyJWT, upload.single("pdf"), submitAnswerCopy);
router.post("/answer-copies/grade", verifyJWT, gradeAnswerCopy);
router.get("/already_check/:id",verifyJWT, alreadycheck);

router.get("/answer-copies/:answerCopyId", verifyJWT, getAnswerCopy);
router.get("/answer-copies/result/:answerCopyId", verifyJWT, getAnswerCopyResult);

router.get("/answer-copies/standard/:standard", getAllAnswerCopy);
router.get("/answer-copies/standard/:standard/:subject", getAllAnswerCopysubjectwise);
router.get("/answer-copies/teacher/:teacherId", getAllbyteacher);


export default router;

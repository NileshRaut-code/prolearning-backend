import express from "express";
import {
  createClassroom,
  getClassrooms,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  addStudentToClassroom,
  removeStudentFromClassroom,
  getStudentsInClassroom,
} from "../controllers/classroom.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/classrooms", verifyJWT, createClassroom);
router.get("/classrooms", verifyJWT, getClassrooms);
router.get("/classrooms/:id", verifyJWT, getClassroomById);
router.put("/classrooms/:id", verifyJWT, updateClassroom);
router.delete("/classrooms/:id", verifyJWT, deleteClassroom);
router.post("/classrooms/:id/students", verifyJWT, addStudentToClassroom);
router.delete("/classrooms/:id/students/:studentId", verifyJWT, removeStudentFromClassroom);
router.get("/classrooms/:id/students", verifyJWT, getStudentsInClassroom);

export default router;

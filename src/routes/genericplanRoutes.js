import express from "express";
import { plangenerate } from "../controllers/genericplanController.js";

const router=express.Router();

router.get("/:standard",plangenerate);

export default router;
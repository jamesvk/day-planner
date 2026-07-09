import express from "express";
import { handlePlanTrip } from "../controllers/tripController.js";

const router = express.Router();

router.post("/", handlePlanTrip);

export default router;

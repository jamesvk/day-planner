import express from "express";
import {
  handlePlanTrip,
  handleGetTrip,
} from "../controllers/tripController.js";

const router = express.Router();

router.post("/", handlePlanTrip);
router.get("/:id", handleGetTrip);

export default router;

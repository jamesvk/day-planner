import express from "express";
import {
  handlePlanTrip,
  handleGetTrip,
  handleDeleteTrip,
} from "../controllers/tripController.js";

const router = express.Router();

router.post("/", handlePlanTrip);
router.get("/:id", handleGetTrip);
router.delete("/:id", handleDeleteTrip);

export default router;

import express from "express";
import { protect } from "../middleware/auth.js";
import {
  handlePlanTrip,
  handleGetTrips,
  handleGetTrip,
  handleDeleteTrip,
} from "../controllers/tripController.js";

const router = express.Router();

router.use(protect);

router.post("/", handlePlanTrip);
router.get("/", handleGetTrips);
router.get("/:id", handleGetTrip);
router.delete("/:id", handleDeleteTrip);

export default router;

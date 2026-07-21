import type { Request, Response } from "express";
import { planTrip } from "../pipeline/planTrip.js";
import type { ParseRequest } from "../types.js";
import saveTrip from "../utils/saveTrip.js";
import getAllTrips from "../utils/getAllTrips.js";
import getTrip from "../utils/getTrip.js";
import deleteTrip from "../utils/deleteTrip.js";

export async function handlePlanTrip(req: Request, res: Response) {
  try {
    const { rawText }: ParseRequest = req.body;

    if (!rawText || typeof rawText !== "string") {
      return res
        .status(400)
        .json({ message: "rawText is required and must be a string" });
    }

    const trip = await planTrip({ rawText });
    await saveTrip(trip);

    console.log(JSON.stringify(trip, null, 2));

    return res.status(200).json(trip);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to plan trip" });
  }
}

export async function handleGetTrips(req: Request, res: Response) {
  try {
    const trips = await getAllTrips();
    res.status(200).json(trips);
  } catch (err) {
    console.error("handleGetTrips error: ", err);
    return res.status(500).json({ message: "Failed ot retrieve trips" });
  }
}

export async function handleGetTrip(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const trip = await getTrip(id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    else return res.status(200).json(trip);
  } catch (err) {
    console.error("handleGetTrip error: ", err);
    return res.status(500).json({ message: "Failed to retrieve trip" });
  }
}

export async function handleDeleteTrip(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await deleteTrip(id);
    if (!deleted) return res.status(404).json({ message: "Trip not found" });
    return res.status(204).end();
  } catch (err) {
    console.error("handleDeleteTrip error: ", err);
    return res.status(500).json({ message: "Failed to delete trip" });
  }
}

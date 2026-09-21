import type { Response } from "express";
import { planTrip } from "../pipeline/planTrip.js";
import type { ParseRequest, AuthenticatedRequest } from "../types.js";
import saveTrip from "../utils/saveTrip.js";
import getAllTrips from "../utils/getAllTrips.js";
import getTrip from "../utils/getTrip.js";
import deleteTrip from "../utils/deleteTrip.js";
import { ValidationError } from "../utils/errors.js";

export async function handlePlanTrip(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authorized" });
    }
    const { rawText, name }: { rawText: string; name: string } = req.body;

    if (!rawText || typeof rawText !== "string") {
      return res
        .status(400)
        .json({ message: "rawText is required and must be a string" });
    }
    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "name is required and must be a string" });
    }

    const trip = await planTrip({ rawText });
    const savedTripId = await saveTrip(trip, req.user.id, name);

    return res.status(201).json({ ...trip, id: savedTripId, name });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.message });
    }
    console.error("handlePlanTrip error: ", err);
    return res.status(500).json({ message: "Failed to plan trip" });
  }
}

export async function handleGetTrips(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authorized" });
    }
    const trips = await getAllTrips(req.user.id);
    return res.status(200).json(trips);
  } catch (err) {
    console.error("handleGetTrips error: ", err);
    return res.status(500).json({ message: "Failed to retrieve trips" });
  }
}

export async function handleGetTrip(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authorized" });
    }
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const trip = await getTrip(id, req.user.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    return res.status(200).json(trip);
  } catch (err) {
    console.error("handleGetTrip error: ", err);
    return res.status(500).json({ message: "Failed to retrieve trip" });
  }
}

export async function handleDeleteTrip(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authorized" });
    }
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await deleteTrip(id, req.user.id);
    if (!deleted) return res.status(404).json({ message: "Trip not found" });
    return res.status(204).end();
  } catch (err) {
    console.error("handleDeleteTrip error: ", err);
    return res.status(500).json({ message: "Failed to delete trip" });
  }
}

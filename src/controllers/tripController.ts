import type { Request, Response } from "express";
import { planTrip } from "../pipeline/planTrip.js";
import type { ParseRequest } from "../types.js";
import saveTrip from "../utils/saveTrip.js";
import getTrip from "../utils/getTrip.js";

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

export async function handleGetTrip(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const trip = await getTrip(id);
    res.status(200).json(trip);
  } catch (err) {
    console.error("handleGetTrip error: ", err);
    return res.status(500).json({ message: "Failed to retrieve trip" });
  }
}

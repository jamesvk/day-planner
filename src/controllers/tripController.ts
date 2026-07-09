import type { Request, Response } from "express";
import { planTrip } from "../pipeline/planTrip.js";
import type { ParseRequest } from "../types.js";

export async function handlePlanTrip(req: Request, res: Response) {
  try {
    const { rawText }: ParseRequest = req.body;

    if (!rawText || typeof rawText !== "string") {
      return res
        .status(400)
        .json({ message: "rawText is required and must be a string" });
    }

    const trip = await planTrip({ rawText });
    return res.status(200).json(trip);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to plan trip" });
  }
}

import pool from "../db.js";
import type { NarratedTrip } from "../types.js";

export default async function saveTrip(input: NarratedTrip) {
  const { rawText, date, transportMode, dayStart, dayEnd, feasible } = input;

  try {
    const savedTrip = await pool.query(
      `INSERT INTO trips (raw_text, date, transport_mode, day_start, day_end, feasible) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [rawText, date, transportMode, dayStart, dayEnd, feasible],
    );

    console.log("savedTrip >>>>> ", savedTrip);
  } catch (error) {
    throw new Error("Failed to save trip in the database");
  }
}

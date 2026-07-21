import pool from "../db.js";
import type { NarratedTrip } from "../types.js";

export default async function saveTrip(input: NarratedTrip) {
  const { rawText, date, transportMode, dayStart, dayEnd, feasible, summary } =
    input;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const savedTrip = await client.query(
      `INSERT INTO trips (raw_text, date, transport_mode, day_start, day_end, feasible, summary) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [rawText, date, transportMode, dayStart, dayEnd, feasible, summary],
    );
    const savedTripId = savedTrip.rows[0].id;

    for (const [index, s] of input.scheduledStops.entries()) {
      await client.query(
        `INSERT INTO scheduled_stops (trip_id, stop_order, name, event, address, place_id, lat, lng, arrival_time, departure_time, travel_to_next_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          savedTripId,
          index + 1,
          s.stop.name,
          s.stop.event,
          s.stop.address,
          s.stop.place_id,
          s.stop.location.lat,
          s.stop.location.lng,
          s.arrivalTime,
          s.departureTime,
          s.travelToNextMinutes,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`Failed to save trip in the database: ${err}`);
  } finally {
    client.release();
  }
}

import pool from "../db.js";
import type { tripSummary, RetrievedTrips } from "../types.js";

export default async function getAllTrips(): Promise<RetrievedTrips> {
  const trips = await pool.query<tripSummary>(
    `
            SELECT
                t.id,
                t.raw_text AS "rawText",
                t.date,
                t.transport_mode AS "transportMode",
                t.day_start AS "dayStart",
                t.day_end AS "dayEnd",
                t.feasible,
                t.created_at AS "createdAt",
                t.summary,
                (SELECT COUNT(*)::int FROM scheduled_stops s WHERE s.trip_id = t.id) AS "stopCount"
            FROM trips t
            ORDER BY t.created_at DESC
        `,
  );

  return trips.rows;
}

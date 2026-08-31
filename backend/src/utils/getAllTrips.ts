import pool from "../db.js";
import type { TripSummary, RetrievedTrips } from "../types.js";

export default async function getAllTrips(
  userId: string,
): Promise<RetrievedTrips> {
  const trips = await pool.query<TripSummary>(
    `
            SELECT
                t.id,
                t.name,
                t.city,
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
            WHERE t.user_id = $1
            ORDER BY t.date ASC        `,
    [userId],
  );

  return trips.rows;
}

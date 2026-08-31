import pool from "../db.js";
import type { RetrievedTrip } from "../types.js";

export default async function getTrip(
  tripId: string,
  userId: string,
): Promise<RetrievedTrip | null> {
  const trip = await pool.query(
    `
        SELECT json_build_object(
            'id', t.id,
            'name', t.name,
            'rawText', t.raw_text,
            'date', t.date,
            'transportMode', t.transport_mode,
            'dayStart', t.day_start,
            'dayEnd', t.day_end,
            'feasible', t.feasible,
            'createdAt', t.created_at,
            'summary', t.summary,
            'scheduledStops', COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', s.id,
                            'stop_order', s.stop_order,
                            'name', s.name,
                            'event', s.event,
                            'address', s.address,
                            'place_id', s.place_id,
                            'lat', s.lat,
                            'lng', s.lng,
                            'arrivalTime', s.arrival_time,
                            'departureTime', s.departure_time,
                            'travelToNextMinutes', s.travel_to_next_minutes
                        )
                        ORDER BY s.stop_order ASC
                    )
                    FROM scheduled_stops s
                    WHERE s.trip_id = t.id
                ),
                '[]'::json
            )
        ) AS trip
        FROM trips t
        WHERE t.id = $1 AND t.user_id = $2
        `,
    [tripId, userId],
  );

  if (!trip.rows.length) return null;
  else return trip.rows[0].trip;
}

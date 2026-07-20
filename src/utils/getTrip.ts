import pool from "../db.js";
import type { RetrievedTrip } from "../types.js";

export default async function getTrip(id: string): Promise<RetrievedTrip> {
  const trip = await pool.query(
    `
            SELECT json_build_object(
                'id', t.id,
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
            WHERE t.id = $1
            `,
    [id],
  );
  return trip.rows[0].trip;
}

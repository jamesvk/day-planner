import type { ScheduledTrip } from "../types.js";

export function totalTravel(trip: ScheduledTrip): number {
  return trip.scheduledStops.reduce(
    (acc, curr) => acc + curr.travelToNextMinutes,
    0,
  );
}

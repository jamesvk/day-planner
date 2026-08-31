import type { ParsedTrip } from "../types.js";
import { timeToMinutes, minutesToTime } from "./time.js";

export function normalizeDayWindow(trip: ParsedTrip): ParsedTrip {
  let start = timeToMinutes(trip.dayStart);
  let end = timeToMinutes(trip.dayEnd);

  for (const stop of trip.stops) {
    if (!stop.fixedTimes) continue;

    const fixedStart = timeToMinutes(stop.fixedTimes.start);
    const fixedEnd = fixedStart + stop.durationMinutes;

    start = Math.min(start, fixedStart);
    end = Math.max(end, fixedEnd);
  }

  return {
    ...trip,
    dayStart: minutesToTime(start),
    dayEnd: minutesToTime(end),
  };
}

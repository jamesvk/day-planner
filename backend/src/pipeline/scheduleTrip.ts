import type { RoutableTrip, ScheduledTrip, ScheduledStop } from "../types.js";
import { timeToMinutes, minutesToTime } from "../utils/time.js";
import { permute } from "../utils/permutations.js";
import { totalTravel } from "../utils/totalTravel.js";
import { ValidationError } from "../utils/errors.js";

const ORDER_WEIGHT = 45; // minutes charged per out-of-sequence pair
const IDLE_WEIGHT = 0.25; // fraction of a minute charged per waiting minute

function runsPastMidnight(trip: ScheduledTrip): boolean {
  return trip.scheduledStops.some(
    (s) =>
      Number(s.arrivalTime.slice(0, 2)) >= 24 ||
      Number(s.departureTime.slice(0, 2)) >= 24,
  );
}

function totalIdle(trip: ScheduledTrip): number {
  return trip.scheduledStops.reduce((sum, s) => {
    const arrival = timeToMinutes(s.arrivalTime);
    const departure = timeToMinutes(s.departureTime);
    return sum + Math.max(0, departure - arrival - s.stop.durationMinutes);
  }, 0);
}

function orderInversions(order: number[]): number {
  let count = 0;
  for (let i = 0; i < order.length; i++) {
    for (let j = i + 1; j < order.length; j++) {
      if (order[i]! > order[j]!) count++;
    }
  }
  return count;
}

function scheduleOneOrder(input: RoutableTrip, order: number[]): ScheduledTrip {
  let currentTime = timeToMinutes(input.dayStart);
  const dayEndMinutes = timeToMinutes(input.dayEnd);
  const { stops, travelTimes } = input;

  let feasible = true;
  const scheduledStops: ScheduledStop[] = [];

  for (const [index, stopIndex] of order.entries()) {
    const arrival = currentTime;
    const stop = stops[stopIndex];
    if (!stop) continue;

    let effectiveStart: number;
    if (stop.fixedTimes) {
      const fixedStart = timeToMinutes(stop.fixedTimes.start);
      if (arrival > fixedStart) {
        feasible = false;
      }
      effectiveStart = Math.max(arrival, fixedStart);
    } else {
      effectiveStart = arrival;
    }

    const departure = effectiveStart + stop.durationMinutes;
    if (departure > dayEndMinutes) {
      feasible = false;
    }

    const nextStopNumber = order[index + 1];
    const travelToNext =
      nextStopNumber !== undefined
        ? (travelTimes[stopIndex]?.[nextStopNumber] ?? 0)
        : 0;
    currentTime = departure + travelToNext;
    scheduledStops.push({
      stop,
      arrivalTime: minutesToTime(arrival),
      departureTime: minutesToTime(departure),
      travelToNextMinutes: travelToNext,
    });
  }

  const result = {
    rawText: input.rawText,
    city: input.city,
    date: input.date,
    transportMode: input.transportMode,
    dayStart: input.dayStart,
    dayEnd: input.dayEnd,
    scheduledStops,
    feasible,
  };

  if (runsPastMidnight(result)) result.feasible = false;

  return result;
}

export function scheduleTrip(input: RoutableTrip): ScheduledTrip {
  let bestFeasible: ScheduledTrip | null = null;
  let bestFeasibleScore = Infinity;
  let bestOverall: ScheduledTrip | null = null;
  let bestOverallScore = Infinity;

  const allPermutations: number[][] = permute(
    input.stops.map((_, index) => index),
  );

  for (const order of allPermutations) {
    const scheduleCandidate = scheduleOneOrder(input, order);

    const score =
      totalTravel(scheduleCandidate) +
      ORDER_WEIGHT * orderInversions(order) +
      IDLE_WEIGHT * totalIdle(scheduleCandidate);

    if (score < bestOverallScore) {
      bestOverall = scheduleCandidate;
      bestOverallScore = score;
    }

    if (scheduleCandidate.feasible && score < bestFeasibleScore) {
      bestFeasible = scheduleCandidate;
      bestFeasibleScore = score;
    }
  }

  if (!bestOverall) {
    throw new Error("No orderings could be scheduled");
  }

  const chosen = bestFeasible ?? bestOverall;
  if (runsPastMidnight(chosen)) {
    throw new ValidationError(
      "This itinerary runs past midnight. Try removing a stop, shortening a visit, or widening your day.",
    );
  }

  return chosen;
}

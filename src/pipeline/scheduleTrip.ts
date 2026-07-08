import type { RoutableTrip, ScheduledTrip, ScheduledStop } from "../types.js";
import { timeToMinutes, minutesToTime } from "../utils/time.js";
import { permute } from "../utils/permutations.js";
import { totalTravel } from "../utils/totalTravel.js";

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
  return {
    date: input.date,
    transportMode: input.transportMode,
    dayStart: input.dayStart,
    dayEnd: input.dayEnd,
    scheduledStops,
    feasible,
  };
}

export function scheduleTrip(input: RoutableTrip): ScheduledTrip {
  let bestFeasible: ScheduledTrip | null = null;
  let bestFeasibleTime = Infinity;
  let bestOverall: ScheduledTrip | null = null;
  let bestOverallTime = Infinity;

  const allPermutations: number[][] = permute(
    input.stops.map((_, index) => index),
  );

  for (const order of allPermutations) {
    const scheduleCandidate = scheduleOneOrder(input, order);
    const travelTime = totalTravel(scheduleCandidate);

    // update bestOverall (any trip, least travel)
    if (travelTime < bestOverallTime) {
      bestOverall = scheduleCandidate;
      bestOverallTime = travelTime;
    }

    // update bestFeasible (only feasible trips, least travel)
    if (scheduleCandidate.feasible && travelTime < bestFeasibleTime) {
      bestFeasible = scheduleCandidate;
      bestFeasibleTime = travelTime;
    }
  }

  if (!bestOverall) {
    throw new Error("No orderings could be scheduled");
  }

  bestFeasible
    ? console.log(JSON.stringify(bestFeasible, null, 2))
    : console.log(JSON.stringify(bestOverall, null, 2));

  return bestFeasible ?? bestOverall;
}

// export function scheduleTrip(input: RoutableTrip): ScheduledTrip {
//   let bestFeasible = null;
//   let bestOverall = null;
//   let bestOverallTime: number = 0;

//   const allPermutations: number[][] = permute(
//     input.stops.map((_, index) => index),
//   );
//   // const feasibleTrips: ScheduledTrip[] = [];

//   for (const order of allPermutations) {
//     const scheduledCandidate = scheduleOneOrder(input, order);
//     const travelTime = totalTravel(scheduledCandidate);

//     // update bestOverall (any trip, least travel)
//     if (bestOverall === null || travelTime < bestOverallTime) {
//       bestOverall = scheduledCandidate;
//       bestOverallTime = travelTime;
//     }

//     if (scheduledCandidate.feasible && (bestFeasible === null || travelTime < bestOverallTime)) {
//       bestFeasible = scheduledCandidate;
//       bestOverall = scheduledCandidate;
//       bestOverallTime = travelTime;
//     }
//     //   if (scheduledCandidate.feasible) {
//     //     feasibleTrips.push(scheduledCandidate);
//     //   }
//   }

//   // console.log(feasibleTrips);
//   // console.log(JSON.stringify(feasibleTrips, null, 2));
// }

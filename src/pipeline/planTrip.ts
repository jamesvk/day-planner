import type {
  ParseRequest,
  ParsedTrip,
  GeocodedTrip,
  RoutableTrip,
  ScheduledTrip,
  NarratedTrip,
} from "../types.js";
import { parseTrip } from "./parseTrip.js";
import { geocodeTrip } from "./geocodeTrip.js";
import { routeTrip } from "./routeTrip.js";
import { scheduleTrip } from "./scheduleTrip.js";
import { narrateTrip } from "./narrateTrip.js";

export async function planTrip(input: ParseRequest): Promise<NarratedTrip> {
  const parsedTrip = await parseTrip(input);
  const geocodedTrip = await geocodeTrip(parsedTrip);
  const routedTrip = await routeTrip(geocodedTrip);
  const scheduledTrip = await scheduleTrip(routedTrip);
  const narratedTrip = await narrateTrip(scheduledTrip);

  return narratedTrip;
}

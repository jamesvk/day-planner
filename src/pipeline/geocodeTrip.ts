import "dotenv/config";
import type { ParsedTrip, GeocodedStop, GeocodedTrip } from "../types.js";

export async function geocodeTrip(input: ParsedTrip): Promise<GeocodedTrip> {
  try {
    const geocodedStops: GeocodedStop[] = [];

    for (const stop of input.stops) {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(stop.name)}&format=json&limit=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            process.env.NOMINATIM_USER_AGENT ?? "day-planner-backend/1.0",
        },
      });
      const data = await response.json();
      const result = data[0];

      if (!result) {
        throw new Error(`Failed to fetch coordinates for ${stop.name}`);
      }

      geocodedStops.push({
        ...stop,
        place_id: String(result.place_id),
        location: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
      });
    }

    // console.log(geocodedStops);

    return { ...input, stops: geocodedStops };
  } catch (error) {
    throw new Error(`Failed to fetch coordinates: ${error}`);
  }
}

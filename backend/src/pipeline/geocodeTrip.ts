import "dotenv/config";
import type { ParsedTrip, GeocodedStop, GeocodedTrip } from "../types.js";
import { sleep } from "../utils/sleep.js";
import { ValidationError } from "../utils/errors.js";

const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? "day-planner-backend/1.0";

async function geocodeOnce(query: string, viewbox?: string) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
  });

  if (viewbox) {
    params.set("viewbox", viewbox);
    params.set("bounded", "0");
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: { "User-Agent": USER_AGENT },
    },
  );

  if (!response.ok) throw new Error(`Nominatim responded ${response.status}`);

  const data = await response.json();
  await sleep(1000);
  return data[0];
}

function kmBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const dLat = (a.lat - b.lat) * 111;
  const dLng = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

export async function geocodeTrip(input: ParsedTrip): Promise<GeocodedTrip> {
  const cityResult = await geocodeOnce(input.city);

  if (!cityResult) {
    throw new ValidationError(
      `Couldn't find "${input.city}". Try including the state or country.`,
    );
  }

  const center = {
    lat: parseFloat(cityResult.lat),
    lng: parseFloat(cityResult.lon),
  };
  const pad = 0.5;
  const viewbox = `${center.lng - pad},${center.lat + pad},${center.lng + pad},${center.lat - pad}`;

  const geocodedStops: GeocodedStop[] = [];

  for (const stop of input.stops) {
    const primary = stop.address ? `${stop.name}, ${stop.address}` : stop.name;
    let result = await geocodeOnce(primary, viewbox);

    if (!result && stop.address) {
      result = await geocodeOnce(stop.address, viewbox);
    }
    if (!result) {
      throw new ValidationError(
        `Couldn't find "${stop.name}". Try adding its full street address.`,
      );
    }

    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

    if (kmBetween(location, center) > 100) {
      throw new ValidationError(
        `"${stop.name}" matched a location far outside ${input.city}. Try adding its full street address.`,
      );
    }

    geocodedStops.push({
      ...stop,
      place_id: String(result.place_id),
      location,
    });
  }

  return { ...input, stops: geocodedStops };
}

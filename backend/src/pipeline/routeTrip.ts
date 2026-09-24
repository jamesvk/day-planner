import type { GeocodedTrip, RoutableTrip } from "../types.js";

export async function routeTrip(input: GeocodedTrip): Promise<RoutableTrip> {
  try {
    const coordString = input.stops
      .map((stop) => `${stop.location.lng},${stop.location.lat}`)
      .join(";");

    const url = `https://router.project-osrm.org/table/v1/driving/${encodeURIComponent(coordString)}?annotations=duration`;

    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text();
      console.error("routeTrip OSRM: ", response.status, body);
      throw new Error(`OSRM failed: ${response.status}`);
    }
    const data = await response.json();

    if (data.code !== "Ok" || !data.durations) {
      throw new Error(`OSRM code: ${data.code}`);
    }

    const travelTimes = data.durations.map((times: number[]) =>
      times.map((seconds: number) => Math.ceil(seconds / 60)),
    );
    return { ...input, travelTimes };
  } catch (error) {
    throw new Error(`Failed to get the travel time matrix: ${error}`);
  }
}

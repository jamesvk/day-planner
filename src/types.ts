export interface ParseRequest {
  rawText: string;
}

type TransportMode = "driving" | "walking" | "transit";

interface TripMeta {
  date: string;
  transportMode: TransportMode;
  dayStart: string;
  dayEnd: string;
}

interface ParsedStop {
  name: string;
  event?: string;
  address?: string;
  durationMinutes: number;
  fixedTimes?: { start: string; end: string };
}

export interface ParsedTrip extends TripMeta {
  stops: ParsedStop[];
}

export interface GeocodedStop extends ParsedStop {
  readonly place_id: string;
  location: { lat: number; lng: number };
}

export interface GeocodedTrip extends TripMeta {
  stops: GeocodedStop[];
}

export interface RoutableTrip extends GeocodedTrip {
  travelTimes: number[][];
}

export interface ScheduledStop {
  stop: GeocodedStop;
  arrivalTime: string;
  departureTime: string;
  travelToNextMinutes: number;
}
export interface ScheduledTrip extends TripMeta {
  scheduledStops: ScheduledStop[];
  feasible: boolean;
}

export interface NarratedTrip extends ScheduledTrip {
  summary: string;
}

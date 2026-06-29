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
  address: string;
  durationMinutes: number;
  fixedTimes?: { start: number; end: number };
}

export interface ParsedTrip extends TripMeta {
  stops: ParsedStop[];
}

interface GeocodedStop extends ParsedStop {
  readonly id: string;
  location: { lat: number; lng: number };
}

export interface GeocodedTrip extends TripMeta {
  stops: GeocodedStop[];
}

export interface RoutableTrip extends GeocodedTrip {
  travelTimes: number[][];
}

interface ScheduledStop {
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

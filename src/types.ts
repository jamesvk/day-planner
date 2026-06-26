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

interface ParsedTrip extends TripMeta {
  stops: ParsedStop[];
}

interface GeocodedStop extends ParsedStop {
  readonly id: string;
  location: {lat: number, lng: number};
}

interface GeocodedTrip extends TripMeta {
  stops: GeocodedStop[];
}

interface RoutableTrip extends GeocodedTrip {
  travelTimes: number[][];
}

interface ScheduledStop {
  stop: GeocodedStop;
  arrivalTime: string;
  departureTime: string;
  travelToNextMinutes: number;
}

interface ScheduledTrip extends TripMeta {
  scheduledStops: ScheduledStop[];
  feasible: boolean;
}
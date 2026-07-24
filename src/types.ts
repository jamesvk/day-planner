export interface InputUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accessToken: string;
}

export interface ParseRequest {
  rawText: string;
}

type TransportMode = "driving" | "walking" | "transit";

interface TripMeta {
  rawText: string;
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

interface RetrievedStop {
  id: string;
  stop_order: number;
  name: string;
  event?: string;
  address?: string;
  readonly place_id: string | null;
  lat: number;
  lng: number;
  arrivalTime: string;
  departureTime: string;
  travelToNextMinutes: number | null;
}

export interface RetrievedTrip {
  id: string;
  rawText: string;
  date: string;
  transportMode: TransportMode;
  dayStart: string;
  dayEnd: string;
  feasible: boolean;
  createdAt: string;
  summary: string;
  scheduledStops: RetrievedStop[];
}

export interface tripSummary {
  id: string;
  rawText: string;
  date: Date;
  transportMode: TransportMode;
  dayStart: string;
  dayEnd: string;
  feasible: boolean;
  createdAt: Date;
  summary: string;
  stopCount: number;
}

export type RetrievedTrips = tripSummary[];

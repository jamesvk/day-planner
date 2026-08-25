import type { ReactNode } from "react";
import type { SubmitEvent } from "react";

export interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthContextType {
  userId: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

export type FormSubmitEvent = SubmitEvent<HTMLFormElement>;

export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accessToken: string;
}

export interface LoginResponse {
  id: string;
  accessToken: string;
}

interface TripStop {
  name: string;
  event?: string;
  address?: string;
  durationMinutes: number;
  fixedTimes?: { start: string; end: string };
  place_id: string;
  location: { lat: number; lng: number };
}

interface ScheduledStop {
  stop: TripStop;
  arrivalTime: string;
  departureTime: string;
  travelToNextMinutes: number;
}

export interface CreatedTrip {
  summary: string;
  scheduledStops: ScheduledStop[];
  feasible: boolean;
  rawText: string;
  date: string;
  transportMode: "driving" | "walking" | "transit";
  dayStart: string;
  dayEnd: string;
}

export interface TripSummary {
  id: string;
  rawText: string;
  date: string;
  transportMode: "driving" | "walking" | "transit";
  dayStart: string;
  dayEnd: string;
  feasible: boolean;
  createdAt: string;
  summary: string;
  stopCount: number;
}

interface RetrievedStop {
  id: string;
  stop_order: number;
  name: string;
  event?: string;
  address?: string;
  place_id: string | null;
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
  transportMode: "driving" | "walking" | "transit";
  dayStart: string;
  dayEnd: string;
  feasible: boolean;
  createdAt: string;
  summary: string;
  scheduledStops: RetrievedStop[];
}

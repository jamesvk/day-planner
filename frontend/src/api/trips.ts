import { apiFetch } from "./client";
import type { CreatedTrip, TripSummary, RetrievedTrip } from "../types";

export function createTrip(
  rawText: string,
  name: string,
): Promise<CreatedTrip> {
  return apiFetch<CreatedTrip>("/api/trips", {
    method: "POST",
    body: JSON.stringify({ rawText, name }),
  });
}

export function getTrips(): Promise<TripSummary[]> {
  return apiFetch<TripSummary[]>("/api/trips");
}

export function getTrip(id: string): Promise<RetrievedTrip> {
  return apiFetch<RetrievedTrip>(`/api/trips/${id}`);
}

export function deleteTrip(id: string): Promise<undefined> {
  return apiFetch<undefined>(`/api/trips/${id}`, {
    method: "DELETE",
  });
}

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTrips } from "../api/trips";
import type { TripSummary } from "../types";

export default function TripList() {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setTrips(await getTrips());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trips");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading)
    return (
      <p className="p-8 text-center text-sm text-gray-500">Loading trips…</p>
    );
  if (error)
    return <p className="p-8 text-center text-sm text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Your trips</h1>
          <Link
            to="/trips/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New trip
          </Link>
        </div>
        {trips.length > 0 ? (
          trips.map((trip) => {
            const heading = trip.summary.split("\n")[0].replace(/^#\s*/, "");
            const city = heading
              .replace(/^Your\s+/, "")
              .replace(/\s+Day Trip.*$/, "");
            return (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="block rounded-lg border border-indigo-100 bg-indigo-50 p-4 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100 hover:shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-medium text-gray-900">{city}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      trip.feasible
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {trip.feasible ? "Fits" : "Needs adjusting"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(trip.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" · "}
                  {trip.transportMode}
                  {" · "}
                  {trip.stopCount} stops{" · "}
                  {trip.dayStart.slice(0, 5)}–{trip.dayEnd.slice(0, 5)}
                </p>
              </Link>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
            No trips yet.
          </div>
        )}
      </div>
    </div>
  );
}

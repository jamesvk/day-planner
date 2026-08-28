import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { RetrievedTrip } from "../types";
import { getTrip } from "../api/trips";

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<RetrievedTrip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No trip id");
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setTrip(await getTrip(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trip");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading)
    return (
      <p className="p-8 text-center text-sm text-gray-500">Loading trip…</p>
    );
  if (error)
    return <p className="p-8 text-center text-sm text-red-600">{error}</p>;

  if (!trip)
    return (
      <p className="p-8 text-center text-sm text-gray-500">Trip not found.</p>
    );

  const heading = trip.summary.split("\n")[0].replace(/^#\s*/, "");
  const city = heading.replace(/^Your\s+/, "").replace(/\s+Day Trip.*$/, "");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/trips"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          &larr; Back to trips
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Trip detail</h1>

        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-6">
          {" "}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{city}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(trip.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {trip.transportMode}
                {" · "}
                {trip.dayStart.slice(0, 5)}–{trip.dayEnd.slice(0, 5)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${trip.feasible ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
            >
              {trip.feasible ? "Fits" : "Needs adjusting"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {trip.scheduledStops.map((s, i) => (
            <div key={s.id}>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm font-medium text-gray-500">
                  {s.arrivalTime.slice(0, 5)} – {s.departureTime.slice(0, 5)}
                </p>
                <p className="font-medium text-gray-900">{s.name}</p>
                {s.address && (
                  <p className="text-sm text-gray-500">{s.address}</p>
                )}
              </div>
              {s.travelToNextMinutes ? (
                <p className="py-2 text-center text-xs text-gray-400">
                  ↓ {s.travelToNextMinutes} min travel
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-6">
          <div className="prose prose-sm prose-indigo max-w-none">
            <ReactMarkdown>{trip.summary}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

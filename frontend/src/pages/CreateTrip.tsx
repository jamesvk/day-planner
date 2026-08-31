import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormSubmitEvent } from "../types";
import { createTrip } from "../api/trips";

const STOPS_PLACEHOLDER = `Metropolitan Museum of Art, 1000 Fifth Avenue — 2 hours
Katz's Delicatessen, 205 East Houston Street — 1 hour
High Line, Manhattan — 90 minutes
Balthazar, 80 Spring Street — 7pm reservation, 2 hours`;

export default function CreateTrip() {
  const [city, setCity] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("21:00");
  const [stops, setStops] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const rawText = `Day in ${city} on ${date}, driving. Start at ${startTime} and finish by ${endTime}.

${stops}`;

    try {
      const created = await createTrip(rawText);
      navigate(`/trips/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <Link
          to="/trips"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          &larr; Back to trips
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900">New trip</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg bg-white p-8 shadow"
        >
          <div className="space-y-1">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              id="city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York, New York, USA"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700"
              >
                Day starts
              </label>
              <input
                id="startTime"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700"
              >
                Day ends
              </label>
              <input
                id="endTime"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="stops"
              className="block text-sm font-medium text-gray-700"
            >
              Your stops
            </label>
            <p className="text-xs text-gray-500">
              One per line. Include the{" "}
              <span className="font-medium">full address</span>, how long you'll
              stay, and any <span className="font-medium">fixed times</span> — a
              dinner reservation, a tour slot, a game start.
            </p>
            <textarea
              id="stops"
              required
              rows={8}
              value={stops}
              onChange={(e) => setStops(e.target.value)}
              placeholder={STOPS_PLACEHOLDER}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Planning your trip…" : "Create trip"}
          </button>

          {loading && (
            <p className="text-center text-xs text-gray-500">
              Parsing your text, finding each place, routing between them, and
              building the schedule. This usually takes about 30 seconds.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

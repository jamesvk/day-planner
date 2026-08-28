import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormSubmitEvent } from "../types";
import { createTrip } from "../api/trips";

export default function CreateTrip() {
  const [rawText, setRawText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTrip(rawText);
      navigate("/trips");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
              htmlFor="rawText"
              className="block text-sm font-medium text-gray-700"
            >
              Describe your day
            </label>
            <p className="text-xs text-gray-500">
              For best results, include: the{" "}
              <span className="font-medium">city</span>, the{" "}
              <span className="font-medium">date</span> (with the year), how
              you're <span className="font-medium">getting around</span>{" "}
              (driving, walking, or transit), and the{" "}
              <span className="font-medium">hours</span> you want your day to
              run. For each stop, give the{" "}
              <span className="font-medium">full address</span>, how long you'll
              stay, and any <span className="font-medium">fixed times</span> — a
              dinner reservation, a tour slot, a game start.
            </p>
            <textarea
              id="rawText"
              required
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Day in New York City on September 12th, 2026, getting around by transit. I'd like to start around 10am and be done by 10pm. Metropolitan Museum of Art at 1000 Fifth Avenue, Manhattan — about 2 hours. Lunch at Katz's Delicatessen at 205 East Houston Street, Manhattan — an hour. Washington Square Park in Greenwich Village, Manhattan — an hour. Knicks game at Madison Square Square Garden, 4 Pennsylvania Plaza — starts at 7pm, about 3 hours."
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

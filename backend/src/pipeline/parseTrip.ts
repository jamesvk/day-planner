import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import type { ParseRequest, ParsedTrip } from "../types.js";
import { ValidationError } from "../utils/errors.js";
import { normalizeDayWindow } from "../utils/normalizeDayWindow.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseTrip(input: ParseRequest): Promise<ParsedTrip> {
  let message;
  try {
    message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: `Extract structured trip data from freeform text describing a single day.
        Today's date is ${new Date().toISOString().slice(0, 10)}. If the user gives a date without a year, choose the next occurrence of that date that is today or later — never a past year.
        Example output shape: { "date": "2026-07-15", "city": "Paris, France",
        "transportMode": "driving", "dayStart": "09:00", "dayEnd": "18:00",
        "stops": [ { "name": "Parc des Princes", "event": "PSG soccer game vs Lyon",
        "address": "24 Rue du Commandant Guilbaud, Paris",
        "durationMinutes": 60, "fixedTimes": { "start": "20:00", "end": "22:00" } } ] }
        Dates must be formatted as YYYY-MM-DD and times as HH:MM (24-hour).
        city must be the main city or town the stops are in, written in expanded form with its state or country — "New York, New York, USA", not "NYC". If stops span several nearby towns, use the largest or most central one. If the text does not make the location clear, return an empty string for city — do not guess.
        transportMode must be exactly one of: driving, walking, transit.
        The name field must be the physical venue or place that can be found on a map — never an event, activity, or occasion. For example, "PSG game" → name should be "Parc des Princes" (the stadium), not "PSG game". If the user mentions an event, infer the venue where it happens and add the event name to the event field. Only include the event field if the user actually mentioned an event; omit it otherwise.
        Include the address field whenever the user provides an address or the location is unambiguous from the text. Do not invent addresses you are not confident about — omit the field instead.
        The stops are listed in the order the user wants to visit them. Preserve that order in the stops array.
        fixedTimes means a hard commitment the schedule must be built around — a reservation, a ticketed start, a tour slot, an appointment. Include it ONLY when the user states an actual clock time for that specific stop. Never infer fixedTimes from ordering words like "then", "after", or "next", or from a stop's position in the list — those describe sequence, not schedule. A stop with only a duration ("lunch for an hour", "walk for 90 minutes") must have no fixedTimes at all, so the scheduler is free to place it.
        If the user gives an approximate time for the day's beginning or end ("start around 10am", "be done by 8pm"), set dayStart and dayEnd from it — do not turn it into a fixedTimes entry on a stop. If the day ends with a timed activity, set dayEnd to after that activity finishes, not to its start time.
        Example: "Museum around 10am for 2 hours, then lunch at the deli for an hour, then the park for 90 minutes, dinner at 7pm at the bistro" → dayStart is 10:00; the museum, deli, and park have durationMinutes and NO fixedTimes; only the bistro has fixedTimes starting at 19:00.
        The address and fixedTimes fields are optional. Return ONLY the raw JSON object — no markdown, no code fences, no explanatory text.`,
      messages: [{ role: "user", content: input.rawText }],
    });
  } catch (error) {
    throw new Error(`Failed to call Claude API: ${error}`);
  }

  const block = message.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Expected a text response from Claude");
  }
  const responseText = block.text;
  const start = responseText.indexOf("{");
  const end = responseText.lastIndexOf("}");
  const jsonString = responseText.slice(start, end + 1);

  let parsed: ParsedTrip;
  try {
    parsed = JSON.parse(jsonString) as ParsedTrip;
  } catch (error) {
    throw new Error(
      `Failed to parse Claude's response as JSON: ${responseText}`,
    );
  }
  if (!parsed.city) {
    throw new ValidationError(
      "Please include the city or town your trip takes place in.",
    );
  }

  return normalizeDayWindow({ ...input, ...parsed, transportMode: "driving" });
}

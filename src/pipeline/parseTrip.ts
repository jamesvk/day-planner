import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import type { ParseRequest, ParsedTrip } from "../types.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseTrip(input: ParseRequest): Promise<ParsedTrip> {
  let message;
  try {
    message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: `Please extract structured trip data from freeform text.
      An example output shape is: { "date": "2026-07-15",
      "transportMode": "driving", "dayStart": "09:00", "dayEnd": "18:00",
      "stops": [ { "name": "Parc des Princes", "event": "PSG soccer game vs Lyon",
      "address": "24 Rue du Commandant Guilbaud, Paris",
      "durationMinutes": 60, "fixedTimes": { "start": "12:00", "end": "13:00" } } ] }
      Dates must be formatted as YYYY-MM-DD and times as HH:MM (24-hour).
      transportMode must be exactly one of: driving, walking, transit.
      The name field must be the physical venue or place that can be found on a map
      — never an event, activity, or occasion. For example, "PSG game"
      → name should be "Parc des Princes" (the stadium), not "PSG game".
      If the user mentions an event, infer the venue where it happens and add the
      event name to the event field. Only include the event field if the user
      actually mentioned an event; omit it otherwise.
      The address and fixedTimes fields are optional. Return ONLY the raw JSON object
      — no markdown, no code fences, no explanatory text.`,
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
    console.log("parseTrip", JSON.stringify(parsed, null, 2));
  } catch (error) {
    throw new Error(
      `Failed to parse Claude's response as JSON: ${responseText}`,
    );
  }

  return parsed;
}

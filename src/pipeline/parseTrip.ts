import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import type { ParseRequest, ParsedTrip } from "../types.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseTrip(input: ParseRequest): Promise<ParsedTrip> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: `Please extract structured trip data from freeform text.
          An example output shape is: { "date": "2026-07-15",
          "transportMode": "driving", "dayStart": "09:00", "dayEnd": "18:00",
          "stops": [ { "name": "Eiffel Tower", "address": "Champ de Mars, Paris",
          "durationMinutes": 60, "fixedTimes": { "start": "12:00", "end": "13:00" } } ] }
          Dates must be formatted as YYYY-MM-DD and times as HH:MM (24-hour).
          transportMode must be exactly one of: driving, walking, transit.
          The address and fixedTimes field is optional. Return ONLY the raw JSON object
          — no markdown, no code fences, no explanatory text.`,
    messages: [{ role: "user", content: input.rawText }],
  });

  const block = message.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Expected a text response from Claude");
  }
  const responseText = block.text;

  const start = responseText.indexOf("{");
  const end = responseText.lastIndexOf("}");
  const jsonString = responseText.slice(start, end + 1);

  const parsed = JSON.parse(jsonString) as ParsedTrip;
  console.log(JSON.stringify(parsed, null, 2));
  return parsed;
}

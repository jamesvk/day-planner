import Anthropic from "@anthropic-ai/sdk";
// import "dotenv/config";
import type { ScheduledTrip, NarratedTrip } from "../types.ts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function narrateTrip(input: ScheduledTrip): Promise<NarratedTrip> {
  let message;
  try {
    message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: `You are writing a friendly, readable summary of a day-trip schedule for the user.
      The schedule data is in the scheduledStops array, and the trip's feasible field tells you
      whether the plan works within the given time window. First, check the feasible field.
      If the trip is NOT feasible: Let the user know that no arrangement of their stops fits
      within the time window they provided. Explain that the schedule shown is the best overall
      option (the one with the least total travel time), even though it doesn't fully fit. Then
      suggest concrete fixes: removing one or more stops, widening the day's time window, or
      relaxing some fixed start times. If the trip IS feasible: Let the user know this is the
      most efficient workable plan, with the least total travel time. Walk through the day stop by
      stop, mentioning each stop and its arrival time in a natural, conversational way. Point out
      any stops with a wait time over an hour (the gap between when they arrive and when a fixed
      start time begins), and suggest the user could add another activity during those gaps to
      make the most of the day. Keep the tone warm and concise. Refer to any event names
      (the event field) where present. If the transport mode is driving, remind them to allow
      extra time for traffic and parking." That way it doesn't tell a walker to worry about parking`,
      messages: [{ role: "user", content: JSON.stringify(input) }],
    });
  } catch (error) {
    throw new Error(`Failed to call Claude API: ${error}`);
  }

  const block = message.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Expected a text response from Claude");
  }
  const summary = block.text;

  return { ...input, summary };
}

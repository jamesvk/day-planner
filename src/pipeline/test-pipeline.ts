import type { ParseRequest } from "../types.js";
import { planTrip } from "./planTrip.js";

const rawInput: ParseRequest = {
  rawText: `This is random raw input text. Would like to visit:
    Eiffel Tower at 12pm (1 hour), the Champes des Elysee 1 (hour),
    Notre Dame 1(hour), and the PSG game at 9pm (get their by 8pm and
    leave around 12pm). Driving. This is for September 1st, 2026.
    Can start the day as early as 9am.`,
};

async function main() {
  try {
    const result = await planTrip(rawInput);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

main();

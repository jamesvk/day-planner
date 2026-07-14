import type { ParseRequest } from "../types.js";
import { planTrip } from "./planTrip.js";

const rawInput: ParseRequest = {
  rawText: `This is random raw input text. Would like to visit:
    Eiffel Tower (spend 1 hour), the Champes des Elysee (spend 1 hour),
    Notre-Dame de Paris (spend 1 hour), lunch date at Pink Mamma at 12pm (spend 1.5 hours)
    and the PSG game at 7pm (get their by 6pm and
    leave around 10pm). Driving. This is for September 1st, 2026.
    Can start the day as early as 9am.`,
};

async function main() {
  try {
    const result = await planTrip(rawInput);
    // console.log(result);
  } catch (error) {
    console.error(error);
  }
}

main();

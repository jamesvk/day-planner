import type { ParseRequest } from "../types.js";
import { planTrip } from "./planTrip.js";

const rawInput: ParseRequest = {
  rawText:
    "This is random raw input text. Would like to visit: Eiffel Tower at 12pm, the Champes des Elysee, Notre Dame, and the PSG game at 9pm. Driving.",
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

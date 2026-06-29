(DRAFT) Day-Planner — Design

What this app does
This day-planner app provides the most efficient travel schedule/route based on the locations, duration time per stop, fixed-anchor times and travel time. If there isn’t a feasbile route based on input, it will let you know.

The core idea
Explain the "right tool for each job" split in your own words:

- What does the LLM do?
- What does geocoding do?
- What does the maps API do?
- What does the solver do?
- WHY are they kept separate? (You explained this out loud today — write that version.)
  We use several tools to do this. First, an LLM parser parses User input to determine several factors such as location names and duration. The output from the LLM parser then takes the locations and passes the data to a geocoding tool which provides the coordinates of each location. That is then passed to a maps API which provides a travel-time matrix for the solver to compute the best possible travel route. Each tool has a separate job and it is best to separate them for debuggability.

The pipeline

1. Frontend UI →
   - interface ParseRequest {
     rawText: string;
     }

   - Conversational design: everything is in the raw text, no forms.

2. LLM parse →
   - interface ParsedStop {
     name: string;
     address?: string;
     durationMinutes: number;
     fixedTimes?: { start: number; end: number };
     }

   - interface ParsedTrip {
     stops: ParsedStop[];
     date: string;
     transportMode: TransportMode;
     dayStart: string; // the day-fits-or-not boundary you caught working backward from the UI
     dayEnd: string;
     }

   - The LLM extracted everything a HUMAN can express. No coordinates yet(no one speaks lat/long), no id yet (the system assigns that).

3. Geocode →
   - interface GeocodedStop {
     readonly id: string; // system-assigned unique handle
     name: string;
     address: string;
     location: { lat: number; lng: number };
     durationMinutes: number;
     fixedTimes?: { start: number; end: number };
     }

   - interface GeocodedTrip {
     stops: GeocodedStop[];
     date: string;
     transportMode: TransportMode;
     dayStart: string;
     dayEnd: string;
     }

   - Geocoding added ONE thing: coordinates.

4. Maps API →
   - interface RoutableTrip {
     stops: GeocodedStop[];
     travelTimes: number[][];
     date: string; transportMode:
     TransportMode;
     dayStart: string;
     dayEnd: string;
     }

   - Maps API added ONE field: the travel-time matrix.
   - INVARIANT: travelTimes[i][j] = time from stops[i] to stops[j].
   - The matrix indices MUST line up with the stops array order.

5. Solver →
   - interface ScheduledStop {
     stop: GeocodedStop;
     arrivalTime: string;
     departureTime: string;
     travelToNextMinutes: number;
     }

   - interface ScheduledTrip {
     date: string;
     scheduledStops: ScheduledStop[]; // in final visiting order
     feasible: boolean; // YOUR WEDGE — did the day actually fit?

   }

6. LLM narrate → frontend Structured schedule becomes readable text + the calendar view.
   The types
   type TransportMode = "driving" | "walking" | "transit";

Rest mentioned above
Key design decisions
Bullet the choices you made and WHY. In your own words:

- Conversational input, no forms — because this is the potential future user experience. No more drop down menus. Like having a conversation with someone.
- Trip-level vs stop-level fields — things like edate / transportMode / dayStart live on the trip because it is the same for all stops and would be redundant to add them to each stop level field.
- Driving only for v1 — we are building out the foundation first before adding additional features for time purposes.
- Tightest types (durationMinutes: number, not string | number) — we want the tightest possible type to prevent bugs.
- REST + Postgres — why these (and not GraphQL / MongoDB)? Rest is still the industry standard and GraphQL is considered an elegant upgrade. I am learning several new concepts (PostGres, Typescript, etc), so to prevent overload we are sticking with REST. Postgres is also a very popular database that uses SQL data as opposed to mongoDB(not sure what sql and the difference is).
  Out of scope for v1
  I am not building an app that does public transit or walking. This version is just for driving. Also not implimenting graphql.

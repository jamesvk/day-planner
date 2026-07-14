import pool from "../db.js";
import type { NarratedTrip } from "../types.js";

export default async function saveTrip(input: NarratedTrip) {
  const { rawText, date, transportMode, dayStart, dayEnd, feasible } = input;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const savedTrip = await client.query(
      `INSERT INTO trips (raw_text, date, transport_mode, day_start, day_end, feasible) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [rawText, date, transportMode, dayStart, dayEnd, feasible],
    );
    const savedTripId = savedTrip.rows[0].id;

    for (const [index, s] of input.scheduledStops.entries()) {
      await client.query(
        `INSERT INTO scheduled_stops (trip_id, stop_order, name, event, address, place_id, lat, lng, arrival_time, departure_time, travel_to_next_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          savedTripId,
          index + 1,
          s.stop.name,
          s.stop.event,
          s.stop.address,
          s.stop.place_id,
          s.stop.location.lat,
          s.stop.location.lng,
          s.arrivalTime,
          s.departureTime,
          s.travelToNextMinutes,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Failed to save trip in the database: ${error}`);
  } finally {
    client.release();
  }
}

// for loop >>>> {
//   stop: {
//     name: 'Notre-Dame de Paris',
//     address: '6 Parvis Notre-Dame, Paris',
//     durationMinutes: 60,
//     place_id: '98445714',
//     location: { lat: 48.8529371, lng: 2.3500501 }
//   },
//   arrivalTime: '09:00',
//   departureTime: '10:00',
//   travelToNextMinutes: 13
// }

// input >>>>>  {
//   "rawText": "I am planning a trip for September 1st, 2026. I would like to visit: Eiffel Tower (spend 1 hour), the Champes des Elysee (spend 1 hour), Notre-Dame de Paris (spend 1 hour), lunch date at Pink Mamma at 12pm (spend 1.5 hours) and the PSG game at 7pm (get their by 6pm and leave around 10pm). Driving. Can start the day as early as 9am. and would like to finish by 11pm or midnight.",
//   "date": "2026-09-01",
//   "transportMode": "driving",
//   "dayStart": "09:00",
//   "dayEnd": "23:59",
//   "scheduledStops": [
//     {
//       "stop": {
//         "name": "Notre-Dame de Paris",
//         "address": "6 Parvis Notre-Dame, Paris",
//         "durationMinutes": 60,
//         "place_id": "98445714",
//         "location": {
//           "lat": 48.8529371,
//           "lng": 2.3500501
//         }
//       },
//       "arrivalTime": "09:00",
//       "departureTime": "10:00",
//       "travelToNextMinutes": 13
//     },
//     {
//       "stop": {
//         "name": "Pink Mamma",
//         "address": "25 Rue Oberkampf, Paris",
//         "durationMinutes": 90,
//         "fixedTimes": {
//           "start": "12:00",
//           "end": "13:30"
//         },
//         "place_id": "97666771",
//         "location": {
//           "lat": 48.8819128,
//           "lng": 2.3344849
//         }
//       },
//       "arrivalTime": "10:13",
//       "departureTime": "13:30",
//       "travelToNextMinutes": 10
//     },
//     {
//       "stop": {
//         "name": "Champs-Élysées",
//         "address": "Champs-Élysées, Paris",
//         "durationMinutes": 60,
//         "place_id": "97359670",
//         "location": {
//           "lat": 48.8707573,
//           "lng": 2.3053312
//         }
//       },
//       "arrivalTime": "13:40",
//       "departureTime": "14:40",
//       "travelToNextMinutes": 6
//     },
//     {
//       "stop": {
//         "name": "Eiffel Tower",
//         "address": "5 Avenue Anatole France, Paris",
//         "durationMinutes": 60,
//         "place_id": "97838275",
//         "location": {
//           "lat": 48.8582599,
//           "lng": 2.2945006
//         }
//       },
//       "arrivalTime": "14:46",
//       "departureTime": "15:46",
//       "travelToNextMinutes": 12
//     },
//     {
//       "stop": {
//         "name": "Parc des Princes",
//         "event": "PSG soccer game",
//         "address": "24 Rue du Commandant Guilbaud, Paris",
//         "durationMinutes": 240,
//         "fixedTimes": {
//           "start": "18:00",
//           "end": "22:00"
//         },
//         "place_id": "97999778",
//         "location": {
//           "lat": 48.8413634,
//           "lng": 2.2530693
//         }
//       },
//       "arrivalTime": "15:58",
//       "departureTime": "22:00",
//       "travelToNextMinutes": 0
//     }
//   ],
//   "feasible": true,
//   "summary": "# Your Perfect Day in Paris – September 1st, 2026\n\nGreat news! This itinerary works beautifully within your 9am–midnight window. Here's how your day flows:\n\n**9:00 AM – Notre-Dame de Paris**\nStart your morning at this iconic cathedral. You'll have a full hour to explore before heading out.\n\n**10:13 AM – Pink Mamma**\nAfter a quick 13-minute drive, you'll arrive at this trendy spot. You've got a little over 1.5 hours of buffer time here before your noon lunch reservation, so you could grab a coffee nearby or do some early exploring in the neighborhood.\n\n**1:30 PM – Champs-Élysées**\nHead over for an hour of strolling down Paris's most famous avenue. It's only a 10-minute drive away.\n\n**2:46 PM – Eiffel Tower**\nA short 6-minute drive gets you to the Tower for your next hour of sightseeing.\n\n**3:58 PM – Parc des Princes (PSG Game)**\nYou'll have a comfortable 2+ hour wait before the 6pm arrival time you wanted—plenty of time to grab an early dinner, relax, or explore the area around the stadium before settling in for the match. The game runs until 10pm.\n\n**Pro tip:** Since you're driving through Paris, budget extra time for traffic (especially during afternoon hours) and parking, particularly near the Eiffel Tower and the stadium. Your schedule has built-in cushion, so you should be in great shape!\n\nEnjoy your day! 🇫🇷⚽"
// }

// Result {
//   command: 'INSERT',
//   rowCount: 1,
//   oid: 0,
//   rows: [ { id: 'acb3b33f-f69a-4a09-9fd5-b3ac91907d33' } ],
//   fields: [
//     Field {
//       name: 'id',
//       tableID: 24576,
//       columnID: 1,
//       dataTypeID: 2950,
//       dataTypeSize: 16,
//       dataTypeModifier: -1,
//       format: 'text'
//     }
//   ],
//   _parsers: [ [Function: noParse] ],
//   _types: TypeOverrides {
//     _types: {
//       getTypeParser: [Function: getTypeParser],
//       setTypeParser: [Function: setTypeParser],
//       arrayParser: [Object],
//       builtins: [Object]
//     },
//     text: {},
//     binary: {}
//   },
//   RowCtor: null,
//   rowAsArray: false,
//   _prebuiltEmptyResultObject: { id: null }
// }

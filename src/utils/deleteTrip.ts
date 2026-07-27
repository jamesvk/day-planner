import pool from "../db.js";

export default async function deleteTrip(
  tripId: string,
  userID: string,
): Promise<boolean> {
  const deletedTrip = await pool.query(
    `
                DELETE FROM trips t
                WHERE t.id = $1 AND t.user_id = $2;
            `,
    [tripId, userID],
  );

  return (deletedTrip.rowCount ?? 0) > 0;
}

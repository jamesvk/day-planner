import pool from "../db.js";

export default async function deleteTrip(id: string): Promise<boolean> {
  const deletedTrip = await pool.query(
    `
                DELETE FROM trips WHERE id = $1;
            `,
    [id],
  );

  return (deletedTrip.rowCount ?? 0) > 0;
}

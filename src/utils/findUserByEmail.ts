import pool from "../db.js";
import type { UserCredentials } from "../types.js";

// utils/findUserByEmail.ts — pure query
export async function findUserByEmail(
  email: string,
): Promise<UserCredentials | undefined> {
  const normalizedEmail = email.toLowerCase().trim();
  const result = await pool.query(
    `
        SELECT id, password_hash AS "passwordHash"
        FROM users
        WHERE email = $1;
    `,
    [normalizedEmail],
  );

  return result.rows[0];
}

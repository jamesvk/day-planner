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

  //   console.log("findUserByEmail >>>>>> ", result.rows[0]);

  return result.rows[0];
}

// export async function findUserByEmail(
//   user: LoginUser,
// ): Promise<LoggedInUser | undefined> {
//   const { email, password } = user;
//   const normalizedEmail = email.toLowerCase().trim();

//   const result = await pool.query(
//     `
//         SELECT id, password_hash
//         FROM users
//         WHERE email = $1;
//     `,
//     [normalizedEmail],
//   );

//   const foundUser = result.rows[0];
//   if (!foundUser) return undefined;

//   const isMatch = await bcrypt.compare(password, foundUser.password_hash);
//   const accessToken = generateToken(foundUser.id);

//   if (isMatch) {
//     return {
//       id: foundUser.id,
//       accessToken: accessToken,
//     };
//   } else {
//     return undefined;
//   }
// }

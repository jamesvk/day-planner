import type { Request, Response } from "express";
import { createUser } from "../utils/createUser.js";

export async function registerUser(req: Request, res: Response) {
  try {
    const user = await createUser(req.body);

    return res.status(201).json(user);
  } catch (error) {
    console.error("registerUser error: ", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({ message: "Email already in use" });
    }

    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
}

// import pool from "../db.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import type { Request, Response } from "express";
// import type { User } from "../types.js";

// const secret = process.env.JWT_SECRET;
// if (!secret) throw new Error("JWT_SECRET is not set");

// const generateToken = (id: string): string => {
//   return jwt.sign({ id }, secret, { expiresIn: "30d" });
// };

// export async function registerUser(req: Request, res: Response) {
//   try {
//     const { firstName, lastName, email, password } = req.body;
//     const normalizedEmail = email.toLowerCase().trim();

//     const result = await pool.query(
//       `
//             SELECT EXISTS (
//                 SELECT 1
//                 FROM users
//                 WHERE email = $1
//             ) AS email_exists;
//         `,
//       [normalizedEmail],
//     );

//     const emailExists = result.rows[0].email_exists;
//     if (emailExists)
//       return res.status(400).json({ message: "User already exists!" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const savedUser = await pool.query(
//       `INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id`,
//       [firstName, lastName, normalizedEmail, hashedPassword],
//     );

//     const accessToken = generateToken(savedUser.rows[0].id);

//     return res.status(201).json({
//       _id: savedUser.rows[0].id,
//       firstName,
//       lastName,
//       email,
//       accessToken,
//     });
//   } catch (error) {
//     console.error("registerUser error: ", error);
//     return res
//       .status(500)
//       .json({ message: "Server error during registration" });
//   }
// }

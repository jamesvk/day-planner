import pool from "../db.js";
import bcrypt from "bcryptjs";
import type { RegisterInput, RegisteredUser } from "../types.js";
import { generateToken } from "./generateToken.js";

export async function createUser(user: RegisterInput): Promise<RegisteredUser> {
  const { firstName, lastName, email, password } = user;
  const normalizedEmail = email.toLowerCase().trim();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const savedUser = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id`,
    [firstName, lastName, normalizedEmail, hashedPassword],
  );

  const accessToken = generateToken(savedUser.rows[0].id);

  return {
    id: savedUser.rows[0].id,
    firstName,
    lastName,
    email,
    accessToken,
  };
}

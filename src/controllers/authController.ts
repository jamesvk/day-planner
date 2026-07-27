import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import type { Request, Response } from "express";
import type { RegisterInput } from "../types.js";
import { createUser } from "../utils/createUser.js";
import { findUserByEmail } from "../utils/findUserByEmail.js";

export async function registerUser(req: Request, res: Response) {
  try {
    const userInput: RegisterInput = req.body;
    const user = await createUser(userInput);

    return res.status(201).json(user);
  } catch (err) {
    console.error("registerUser error: ", err);
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "23505"
    ) {
      return res.status(409).json({ message: "Email already in use" });
    }

    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const accessToken = generateToken(user.id);
    return res.status(200).json({ id: user.id, accessToken });
  } catch (err) {
    console.error("loginUser error: ", err);
    return res.status(500).json({ message: "Server error during login" });
  }
}

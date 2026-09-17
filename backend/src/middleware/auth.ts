import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types.js";
import pool from "../db.js";

export async function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const bearer = req.headers.authorization?.split(" ")[0];
  const token = req.headers.authorization?.split(" ")[1];

  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("protect: JWT_SECRET is not set");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string" || typeof decoded.id !== "string") {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    const user = await pool.query("SELECT id FROM users WHERE id = $1", [
      decoded.id,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: decoded.id };
  } catch (err) {
    console.error("protect: token verification failed: ", err);

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Not authorized, token expired" });
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    return res.status(500).json({ message: "Failed to authenticate user" });
  }

  next();
}

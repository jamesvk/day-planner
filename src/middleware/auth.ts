import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload, AuthenticatedRequest } from "../types.js";

export async function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    req.user = { id: decoded.id };

    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
}

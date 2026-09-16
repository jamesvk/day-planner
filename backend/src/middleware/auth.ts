import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload, AuthenticatedRequest } from "../types.js";

export function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("protect: JWT_SECRET is not set");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Not authorized, token expired" });
    }
    console.error("protect: token verification failed: ", err);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
}

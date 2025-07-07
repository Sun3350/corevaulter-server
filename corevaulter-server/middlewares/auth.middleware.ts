import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../controllers/auth.controller";

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: "JWT secret not configured" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as {
      userId: string;
    };
    if (!decoded || typeof decoded.userId !== "string") {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

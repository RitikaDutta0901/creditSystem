// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  userReferralCode?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: Missing token" });

    let decoded: JwtPayload | string;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    if (!("userId" in decoded) || !decoded.userId) {
      return res.status(401).json({ message: "Malformed token: missing userId" });
    }

    req.userId = String((decoded as any).userId);
    req.userReferralCode = decoded && typeof (decoded as any).referralCode === "string"
  ? (decoded as any).referralCode
  : undefined;

    next();
  } catch (err) {
    console.error("[auth] unexpected error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default requireAuth;

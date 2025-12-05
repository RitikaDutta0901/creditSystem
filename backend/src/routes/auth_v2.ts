// backend/src/routes/auth_v2.ts
import { Express } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_EXPIRES = "7d";

function genReferralCode() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

async function saveUserWithRetry(userDoc: any, maxAttempts = 6) {
  let attempt = 0;
  while (true) {
    try {
      return await userDoc.save();
    } catch (err: any) {
      const isDupKey = err && (err.code === 11000 || (err?.message && err.message.includes("E11000")));
      if (!isDupKey) throw err;
      attempt++;
      if (attempt >= maxAttempts) throw err;
      userDoc.referralCode = genReferralCode();
    }
  }
}

export default function registerAuthRoutes(app: Express) {
  // REGISTER
  app.post("/auth/register", async (req, res) => {
    try {
      const { name, email, password, refCode } = req.body || {};
      if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) return res.status(409).json({ message: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email: normalizedEmail,
        password: hashed,
        referredBy: refCode || null,
        credits: 0,
        hasConverted: false,
        referralCode: genReferralCode(),
      });

      await saveUserWithRetry(user, 6);

      const token = jwt.sign({ userId: user._id.toString(), referralCode: user.referralCode }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

      const safeUser = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      };

      return res.json({ user: safeUser, token });
    } catch (err: any) {
      // typed as `any` and safe-log using optional chaining
      console.error("[auth_v2] register error:", err?.stack ?? err);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  // LOGIN
  app.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

      const normalizedEmail = String(email).trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user || !user.password) return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ userId: user._id.toString(), referralCode: user.referralCode }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

      const safeUser = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits ?? 0,
      };

      return res.json({ user: safeUser, token });
    } catch (err: any) {
      console.error("[auth_v2] login error:", err?.stack ?? err);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  console.log("Auth v2 registered: POST /auth/register, POST /auth/login");
  return app;
}

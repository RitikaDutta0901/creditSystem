// src/routes/auth.ts
import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { generateUniqueReferralCode } from "../utils/generateReferralCode";

const router = express.Router();

// ... (Types remain the same) ...
type RegisterBody = {
  name?: string;
  email: string;
  password: string;
  refCode?: string | null;
};

type LoginBody = {
  email: string;
  password: string;
};

function signToken(userId: string, referralCode: string) {
  if (!process.env.JWT_SECRET) {
    // Fallback for dev if env is missing to prevent crash
    console.warn("JWT_SECRET is missing, using default secret"); 
    return jwt.sign({ userId, referralCode }, "dev_secret_key", { expiresIn: "7d" });
  }
  return jwt.sign({ userId, referralCode }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /register
router.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, refCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const referralCode = await generateUniqueReferralCode(
      async (candidate) => Boolean(await User.findOne({ referralCode: candidate })),
      name,
      8,
      20
    );

    let referredBy: string | null = null;
    if (refCode) {
      const ref = await User.findOne({ referralCode: refCode.toUpperCase() });
      if (ref) {
        referredBy = ref.referralCode;
      }
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: passwordHash, // <--- FIXED: Map 'passwordHash' to schema field 'password'
      referralCode,
      referredBy,
      credits: 0,
      hasConverted: false,
    });

    await newUser.save();

    const token = signToken(String(newUser._id), newUser.referralCode);

    return res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        credits: newUser.credits,
      },
      token,
    });
  } catch (err: any) {
    console.error("REGISTER ROUTE ERROR:", err);
    next(err);
  }
});

// POST /login
router.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // FIXED: Check 'password' field from Schema, not 'passwordHash'
    if (!user.password) {
      console.error("LOGIN ERROR: user has no password", { userId: user._id, email: user.email });
      return res.status(500).json({ message: "Server error: user credential missing" });
    }

    // FIXED: Compare against user.password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(String(user._id), user.referralCode);

    try {
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
    } catch (cookieErr) {
      console.error("Cookie error", cookieErr);
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      },
      token,
    });
  } catch (err: any) {
    console.error("LOGIN ROUTE ERROR:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
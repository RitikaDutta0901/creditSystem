// backend/src/routes/auth.ts
import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { generateUniqueReferralCode } from "../utils/generateReferralCode";

const router = express.Router();

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

/**
 * Helper to sign JWT for a user
 */
function signToken(userId: string, referralCode: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ userId, referralCode }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/**
 * POST /auth/register
 */
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
      if (ref) referredBy = ref.referralCode;
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      referralCode,
      referredBy,
      credits: 0,
      hasConverted: false,
    });

    await newUser.save();

    const token = signToken(String(newUser._id), newUser.referralCode);

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        credits: newUser.credits,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 */
router.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(String(user._id), user.referralCode);

    /** 
     * ---------------------------------------------------------
     * 🚀 ADDING THE COOKIE HERE (Render + HTTPS + Cross-site)
     * ---------------------------------------------------------
     */
    res.cookie("auth_token", token, {
      httpOnly: true,      // cannot be accessed by JS
      secure: true,        // must be true on Render (HTTPS)
      sameSite: "none",    // required for frontend→backend cross-site
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    /**
     * You still return JSON — cookie stays as extra.
     */
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

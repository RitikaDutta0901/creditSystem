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
 * POST /api/auth/register
 * Body: { name?, email, password, refCode? }
 */
router.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, refCode } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Prevent registrations with extremely short passwords (basic rule)
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check existing
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique referral code (retry if collision)
    const referralCode = await generateUniqueReferralCode(
      async (candidate) => Boolean(await User.findOne({ referralCode: candidate })),
      name,
      8,
      20
    );

    // Validate refCode (if provided) and normalize
    let referredBy: string | null = null;
    if (refCode) {
      const ref = await User.findOne({ referralCode: refCode.toUpperCase() });
      if (ref) {
        referredBy = ref.referralCode;
      } else {
        // If provided refCode invalid, ignore it (or you could return 400)
        referredBy = null;
      }
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

    // Return a minimal user object
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
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(String(user._id), user.referralCode);

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

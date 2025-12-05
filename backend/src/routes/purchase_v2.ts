// backend/src/routes/purchase_v2.ts
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

// Middleware to verify token
const protect = async (req: any, res: Response, next: any) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_key");
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token failed" });
  }
};

// POST /api/purchase
router.post("/", protect, async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Add Credits
    user.credits += 100;

    // 2. Handle Referral Reward (only if not converted yet)
    if (user.referredBy && !user.hasConverted) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        referrer.credits += 50; // Reward referrer
        await referrer.save();
      }
      user.hasConverted = true; // Mark as converted
    }

    await user.save();

    res.json({
      success: true,
      message: "Purchase successful",
      credits: user.credits
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
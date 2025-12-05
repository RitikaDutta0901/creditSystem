// backend/src/routes/dashboard.ts

import express from "express";
import User from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

/**
 * GET /api/dashboard/me
 * Returns:
 *  - referralCode
 *  - total referred users
 *  - referred users who purchased
 *  - total credits
 *  - basic user info
 */
router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    // Fetch signed-in user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referralCode = user.referralCode;

    // Metrics
    const totalReferred = await User.countDocuments({
      referredBy: referralCode,
    });

    const referredWhoPurchased = await User.countDocuments({
      referredBy: referralCode,
      hasConverted: true,
    });

    // Respond with dashboard data
    return res.json({
      referralCode,
      totalReferred,
      referredWhoPurchased,
      totalCredits: user.credits,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

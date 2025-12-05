import express from "express";
import User from "../models/User";

const router = express.Router();

// GET /api/referral/:code/stats
router.get("/:code/stats", async (req, res, next) => {
  try {
    const code = req.params.code;
    const ref = await User.findOne({ referralCode: code });
    if (!ref) return res.status(404).json({ message: "Referral code not found" });

    const totalReferred = await User.countDocuments({ referredBy: code });
    const referredWhoPurchased = await User.countDocuments({ referredBy: code, hasConverted: true });

    res.json({
      referralCode: code,
      referrerName: ref.name,
      totalReferred,
      referredWhoPurchased,
      referrerCredits: ref.credits
    });
  } catch (err) {
    next(err);
  }
});

export default router;

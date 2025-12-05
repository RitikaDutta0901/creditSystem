// backend/src/routes/purchase.ts
import express from "express";
import mongoose from "mongoose";
import Purchase from "../models/Purchase";
import User from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

/**
 * Defensive middleware resolution:
 * If `requireAuth` is not a function (e.g. import issue), we provide a clear fallback
 * middleware so router.post() receives a function and the server doesn't crash
 * with the opaque "argument callback is required" error.
 */
const ensureMiddleware = (mw: any) => {
  if (typeof mw === "function") return mw;
  // fallback middleware that returns a clear error to the client and logs server-side
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Auth middleware is not a function. Make sure `requireAuth` is exported correctly from ../middleware/auth");
    return res.status(500).json({ message: "Server misconfiguration: auth middleware unavailable" });
  };
};

const authMiddleware = ensureMiddleware(requireAuth);

router.post("/buy", authMiddleware, async (req: AuthRequest, res, next) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const amount = typeof req.body.amount === "number" ? req.body.amount : 0;
  const session = await mongoose.startSession();

  try {
    // Explicit transaction control (avoid withTransaction driver quirks)
    session.startTransaction();

    // load user inside session
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const purchase = new Purchase({ userId: user._id, amount });
    await purchase.save({ session });

    if (user.referredBy && !user.hasConverted) {
      const referrer = await User.findOne({ referralCode: user.referredBy }).session(session);
      if (referrer) {
        user.credits += 2;
        user.hasConverted = true;
        referrer.credits += 2;

        await user.save({ session });
        await referrer.save({ session });
      } else {
        user.hasConverted = true;
        await user.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    const refreshed = await User.findById(userId); // outside session
    return res.json({
      message: "Purchase recorded",
      credits: refreshed?.credits ?? 0,
      hasConverted: refreshed?.hasConverted ?? false,
    });
  } catch (err) {
    try { await session.abortTransaction(); } catch (_) { /* ignore */ }
    session.endSession();
    return next(err);
  }
});

export default router;

// backend/src/routes/purchase.ts
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import PurchaseModel from "../models/Purchase";
import User from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.post(
  "/buy",
  requireAuth,
  async (req: Request & AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const amount = typeof req.body.amount === "number" ? req.body.amount : 0;
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async (s: mongoose.ClientSession) => {
          const user = await User.findById(userId).session(s);
          if (!user) throw { status: 404, message: "User not found" };

          // FIX: Added 'as any' to the data array to resolve the TS overload error
          const purchaseDoc = await PurchaseModel.create(
            [{ userId: user._id, amount }] as any, 
            { session: s }
          );
          
          const purchase = Array.isArray(purchaseDoc) ? purchaseDoc[0] : purchaseDoc;

          if (user.referredBy && !user.hasConverted) {
            const referrer = await User.findOne({ referralCode: user.referredBy }).session(s);
            if (referrer) {
              user.credits += 2;
              user.hasConverted = true;
              referrer.credits += 2;

              await user.save({ session: s });
              await referrer.save({ session: s });
            } else {
              user.hasConverted = true;
              await user.save({ session: s });
            }
          }
          return purchase;
        });
      } finally {
        session.endSession();
      }

      const refreshed = await User.findById(userId);
      return res.json({
        message: "Purchase recorded",
        credits: refreshed?.credits ?? 0,
        hasConverted: refreshed?.hasConverted ?? false,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
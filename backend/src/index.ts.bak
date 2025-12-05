// backend/src/index.ts
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import registerAuthRoutes from "./routes/auth_v2";
import registerPurchaseRoutes from "./routes/purchase_v2";
import jwt from "jsonwebtoken";
import User from "./models/User";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/creditsystem";
mongoose
  .connect(MONGO)
  .then(() => console.log("Connected to MongoDB ✔"))
  .catch((err) => console.error("MongoDB connection error:", err));

// register proper routes (auth_v2 & purchase_v2)
registerAuthRoutes(app);
registerPurchaseRoutes(app);

console.log("Auth v2 & Purchase v2 routes registered (if those files exist)");

// Dashboard route that verifies JWT and returns DB-backed stats
app.get("/dashboard/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "Unauthorized: missing token" });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not set in environment");
      return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET not set" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded?.userId ?? null;
    if (!userId) return res.status(401).json({ message: "Malformed token: missing userId" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const referralCode = user.referralCode ?? null;

    const totalReferred = referralCode ? await User.countDocuments({ referredBy: referralCode }) : 0;
    const referredWhoPurchased = referralCode
      ? await User.countDocuments({ referredBy: referralCode, hasConverted: true })
      : 0;

    return res.json({
      referralCode,
      totalReferred,
      referredWhoPurchased,
      totalCredits: user.credits ?? 0,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("[dashboard] error:", err);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
});

app.get("/", (req, res) => res.json({ message: "Backend running" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

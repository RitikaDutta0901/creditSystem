import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "./models/User";

// Import Routes
// Note: Ensure these files export a 'router' (export default router)
import authRoutes from "./routes/auth";
import purchaseRoutes from "./routes/Purchase"; // Updated from purchase_v2 to match standard naming if preferred

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. ROBUST CORS CONFIGURATION ---
const allowedOrigins = [
  "http://localhost:3000",
  // REPLACE THIS with your actual Render Frontend URL (no trailing slash)
  "https://creditsystem-frontend.onrender.com", 
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // Optional: Log the blocked origin for debugging
        console.log("Blocked by CORS:", origin);
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allows cookies and authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// --- 2. DATABASE CONNECTION ---
const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/creditsystem";
mongoose
  .connect(MONGO)
  .then(() => console.log("Connected to MongoDB ✔"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- 3. REGISTER ROUTES ---
// We use app.use() because your route files export a Router
app.use("/api/auth", authRoutes);
app.use("/api/purchase", purchaseRoutes);

console.log("Routes registered: /api/auth, /api/purchase");

// --- 4. DASHBOARD ROUTE ---
app.get("/dashboard/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    // Robust extraction of Bearer token
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET not set in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Malformed token" });
    }

    // Use .lean() for performance when just reading
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referralCode = user.referralCode ?? null;
    const totalReferred = referralCode 
      ? await User.countDocuments({ referredBy: referralCode }) 
      : 0;
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

// Health Check
app.get("/", (req, res) => res.json({ message: "Backend is running 🚀" }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
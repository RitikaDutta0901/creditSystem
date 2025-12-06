// src/index.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";
import purchaseRouter from "./routes/purchase_v2";

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- FIX START: Allow both Localhost and Vercel ---
const allowedOrigins = [
  "http://localhost:3000",                    // Local development
  "https://credit-system-fawn.vercel.app",    // Your Vercel Production URL
  // Remove the trailing slash from the Vercel URL in the list above if you copy-pasted exact URL
  "https://credit-system-fawn.vercel.app/"    // Just in case the browser sends it with a slash
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in our allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
};
// --- FIX END ---

app.use(cors(corsOptions));

// --- MOUNT ROUTES ---
app.use(["/auth", "/api/auth"], authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/purchase", purchaseRouter);

// Health check
app.get(["/health", "/api/health"], (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Backend is up");
});

export default app;
// src/index.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard"; // <-- Import Dashboard
import purchaseRouter from "./routes/purchase_v2"; // <-- Import Purchase (using v2 based on your file tree)

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
};

app.use(cors(corsOptions));

// --- MOUNT ROUTES ---
app.use(["/auth", "/api/auth"], authRouter);
app.use("/api/dashboard", dashboardRouter); // <-- Add this line
app.use("/api/purchase", purchaseRouter);   // <-- Add this line for the Buy button

// Health check
app.get(["/health", "/api/health"], (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Backend is up");
});

export default app;
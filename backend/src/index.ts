import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
};

// apply CORS for all routes (this handles preflight too)
app.use(cors(corsOptions));

// NOTE: removed app.options('*' / '/*') due to path-to-regexp incompatibility in some environments

// mount authentication routes on both paths
app.use(["/auth", "/api/auth"], authRouter);

// health check endpoint
app.get(["/health", "/api/health"], (req, res) => {
  res.json({ status: "ok" });
});

export default app;

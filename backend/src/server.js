// src/server.ts
import app from "./index";
import mongoose from "mongoose";

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

// Optional: connect to MongoDB if MONGO_URI is present
async function start() {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB connected");
    } else {
      console.log("MONGO_URI not provided — skipping mongoose connect");
    }

    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    server.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });

    // graceful shutdown handlers (helpful on hosts like Render)
    process.on("SIGINT", () => {
      console.log("SIGINT received — shutting down");
      server.close(() => process.exit(0));
    });
    process.on("SIGTERM", () => {
      console.log("SIGTERM received — shutting down");
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();

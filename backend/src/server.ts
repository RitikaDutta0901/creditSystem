// src/server.ts
import dotenv from "dotenv";
// 1. Load env vars BEFORE importing other files
dotenv.config(); 

import app from "./index"; // Import your express app
import connectDB from "./utils/db"; // Import the DB connection

const PORT = process.env.PORT || 5000;

// 2. Connect to Database
connectDB();

// 3. Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
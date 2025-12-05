import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";

dotenv.config();

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI || "");
  // Deletes ALL users
  await User.deleteMany({});
  console.log("All users deleted. Database is clean.");
  process.exit();
};

reset();
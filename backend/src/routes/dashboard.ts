import express from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = express.Router();

const protect = async (req: any, res: any, next: any) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_key");
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token failed" });
  }
};

router.get("/me", protect, async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    // --- NEW LOGIC: Count referrals from Database ---
    const referredCount = await User.countDocuments({ referredBy: user.referralCode });
    const convertedCount = await User.countDocuments({ referredBy: user.referralCode, hasConverted: true });

    res.json({
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      credits: user.credits,
      referredCount,  // Send actual count
      convertedCount  // Send actual count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
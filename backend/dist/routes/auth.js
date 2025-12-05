"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/auth.ts
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateReferralCode_1 = require("../utils/generateReferralCode");
const router = express_1.default.Router();
/**
 * Helper to sign JWT for a user
 */
function signToken(userId, referralCode) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jsonwebtoken_1.default.sign({ userId, referralCode }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
/**
 * POST /register
 */
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password, refCode } = req.body;
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        // Prevent registrations with extremely short passwords (basic rule)
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        // Check existing
        const existing = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        // Generate unique referral code (retry if collision)
        const referralCode = await (0, generateReferralCode_1.generateUniqueReferralCode)(async (candidate) => Boolean(await User_1.default.findOne({ referralCode: candidate })), name, 8, 20);
        // Validate refCode (if provided) and normalize
        let referredBy = null;
        if (refCode) {
            const ref = await User_1.default.findOne({ referralCode: refCode.toUpperCase() });
            if (ref) {
                referredBy = ref.referralCode;
            }
            else {
                // If provided refCode invalid, ignore it (or you could return 400)
                referredBy = null;
            }
        }
        const newUser = new User_1.default({
            name,
            email: email.toLowerCase(),
            passwordHash,
            referralCode,
            referredBy,
            credits: 0,
            hasConverted: false,
        });
        await newUser.save();
        const token = signToken(String(newUser._id), newUser.referralCode);
        // Return a minimal user object
        return res.status(201).json({
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                referralCode: newUser.referralCode,
                credits: newUser.credits,
            },
            token,
        });
    }
    catch (err) {
        // Pass through to centralized error handler but ensure it's logged
        console.error("REGISTER ROUTE ERROR:", err && (err.stack || err.message || err));
        next(err);
    }
});
/**
 * POST /login
 */
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        // Defensive: ensure passwordHash exists
        if (!("passwordHash" in user) || !user.passwordHash) {
            console.error("LOGIN ERROR: user has no passwordHash", { userId: user._id, email: user.email });
            return res.status(500).json({ message: "Server error: user credential missing" });
        }
        const ok = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(401).json({ message: "Invalid credentials" });
        // ensure JWT secret present
        if (!process.env.JWT_SECRET) {
            console.error("LOGIN ERROR: JWT_SECRET is not configured");
            return res.status(500).json({ message: "Server error: auth not configured" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: String(user._id), referralCode: user.referralCode }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        // Set secure cookie (wrapped in try-catch so cookie issues don't crash the route)
        try {
            // NOTE: ensure you have cookie-parser middleware enabled in app.ts/server.ts
            res.cookie("auth_token", token, {
                httpOnly: true, // cannot be accessed by JS
                secure: true, // required on Render (HTTPS)
                sameSite: "none", // required for frontend→backend cross-site
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
        }
        catch (cookieErr) {
            console.error("LOGIN: cookie set error", cookieErr && (cookieErr.stack || cookieErr.message || cookieErr));
            // continue — cookie failure should not break login response
        }
        // Return user + token in JSON too (use either cookie or token on frontend)
        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                credits: user.credits,
            },
            token,
        });
    }
    catch (err) {
        // Log full stack to server logs (Render)
        console.error("LOGIN ROUTE ERROR:", err && (err.stack || err.message || String(err)));
        // If DEBUG_SHOW_STACK is enabled, return stack in response for debugging (temporary)
        if (process.env.DEBUG_SHOW_STACK === "true") {
            return res.status(500).json({ message: "Internal Server Error", error: err && (err.stack || err.message || String(err)) });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map
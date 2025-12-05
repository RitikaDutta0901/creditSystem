"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerAuthRoutes;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_EXPIRES = "7d";
function genReferralCode() {
    return Math.random().toString(36).slice(2, 9).toUpperCase();
}
async function saveUserWithRetry(userDoc, maxAttempts = 6) {
    let attempt = 0;
    while (true) {
        try {
            return await userDoc.save();
        }
        catch (err) {
            const isDupKey = err && (err.code === 11000 || (err?.message && err.message.includes("E11000")));
            if (!isDupKey)
                throw err;
            attempt++;
            if (attempt >= maxAttempts)
                throw err;
            userDoc.referralCode = genReferralCode();
        }
    }
}
function registerAuthRoutes(app) {
    // REGISTER
    app.post("/auth/register", async (req, res) => {
        try {
            const { name, email, password, refCode } = req.body || {};
            if (!email || !password)
                return res.status(400).json({ message: "Email and password are required" });
            const normalizedEmail = String(email).trim().toLowerCase();
            const existing = await User_1.default.findOne({ email: normalizedEmail });
            if (existing)
                return res.status(409).json({ message: "User already exists" });
            const hashed = await bcryptjs_1.default.hash(password, 10);
            const user = new User_1.default({
                name,
                email: normalizedEmail,
                password: hashed,
                referredBy: refCode || null,
                credits: 0,
                hasConverted: false,
                referralCode: genReferralCode(),
            });
            await saveUserWithRetry(user, 6);
            const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), referralCode: user.referralCode }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
            const safeUser = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                credits: user.credits,
            };
            return res.json({ user: safeUser, token });
        }
        catch (err) {
            // typed as `any` and safe-log using optional chaining
            console.error("[auth_v2] register error:", err?.stack ?? err);
            return res.status(500).json({ message: "Registration failed" });
        }
    });
    // LOGIN
    app.post("/auth/login", async (req, res) => {
        try {
            const { email, password } = req.body || {};
            if (!email || !password)
                return res.status(400).json({ message: "Email and password are required" });
            const normalizedEmail = String(email).trim().toLowerCase();
            const user = await User_1.default.findOne({ email: normalizedEmail });
            if (!user || !user.password)
                return res.status(401).json({ message: "Invalid credentials" });
            const ok = await bcryptjs_1.default.compare(password, user.password);
            if (!ok)
                return res.status(401).json({ message: "Invalid credentials" });
            const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), referralCode: user.referralCode }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
            const safeUser = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                referralCode: user.referralCode,
                credits: user.credits ?? 0,
            };
            return res.json({ user: safeUser, token });
        }
        catch (err) {
            console.error("[auth_v2] login error:", err?.stack ?? err);
            return res.status(500).json({ message: "Login failed" });
        }
    });
    console.log("Auth v2 registered: POST /auth/register, POST /auth/login");
    return app;
}
//# sourceMappingURL=auth_v2.js.map
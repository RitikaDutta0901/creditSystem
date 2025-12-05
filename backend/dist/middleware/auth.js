"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: Missing token" });
        }
        const token = authHeader.split(" ")[1];
        if (!token)
            return res.status(401).json({ message: "Unauthorized: Missing token" });
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        if (!decoded || typeof decoded === "string") {
            return res.status(401).json({ message: "Invalid token payload" });
        }
        if (!("userId" in decoded) || !decoded.userId) {
            return res.status(401).json({ message: "Malformed token: missing userId" });
        }
        req.userId = String(decoded.userId);
        req.userReferralCode = decoded && typeof decoded.referralCode === "string"
            ? decoded.referralCode
            : undefined;
        next();
    }
    catch (err) {
        console.error("[auth] unexpected error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
exports.default = requireAuth;
//# sourceMappingURL=auth.js.map
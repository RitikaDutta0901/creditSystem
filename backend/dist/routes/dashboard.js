"use strict";
// backend/src/routes/dashboard.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * GET /api/dashboard/me
 * Returns:
 *  - referralCode
 *  - total referred users
 *  - referred users who purchased
 *  - total credits
 *  - basic user info
 */
router.get("/me", auth_1.requireAuth, async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized: Missing user ID" });
        }
        // Fetch signed-in user
        const user = await User_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const referralCode = user.referralCode;
        // Metrics
        const totalReferred = await User_1.default.countDocuments({
            referredBy: referralCode,
        });
        const referredWhoPurchased = await User_1.default.countDocuments({
            referredBy: referralCode,
            hasConverted: true,
        });
        // Respond with dashboard data
        return res.json({
            referralCode,
            totalReferred,
            referredWhoPurchased,
            totalCredits: user.credits,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map
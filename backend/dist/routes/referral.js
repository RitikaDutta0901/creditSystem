"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// GET /api/referral/:code/stats
router.get("/:code/stats", async (req, res, next) => {
    try {
        const code = req.params.code;
        const ref = await User_1.default.findOne({ referralCode: code });
        if (!ref)
            return res.status(404).json({ message: "Referral code not found" });
        const totalReferred = await User_1.default.countDocuments({ referredBy: code });
        const referredWhoPurchased = await User_1.default.countDocuments({ referredBy: code, hasConverted: true });
        res.json({
            referralCode: code,
            referrerName: ref.name,
            totalReferred,
            referredWhoPurchased,
            referrerCredits: ref.credits
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=referral.js.map
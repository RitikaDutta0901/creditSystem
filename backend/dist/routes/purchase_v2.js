"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerPurchaseRoutes;
const mongoose_1 = __importDefault(require("mongoose"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = __importDefault(require("../middleware/auth"));
const authHandler = auth_1.default;
function registerPurchaseRoutes(app) {
    // define handler with the RequestHandler type (this removes the signature redline)
    const purchaseHandler = async (req, res) => {
        // inside the handler, cast req to AuthRequest so TS knows about userId / userReferralCode
        const r = req;
        const userId = r.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const amount = typeof r.body?.amount === "number" ? r.body.amount : 0;
        const session = await mongoose_1.default.startSession();
        try {
            await session.withTransaction(async () => {
                const user = await User_1.default.findById(userId).session(session);
                if (!user)
                    throw { code: 404, message: "User not found" };
                const purchase = new Purchase_1.default({ userId: user._id, amount });
                await purchase.save({ session });
                if (!user.hasConverted && user.referredBy) {
                    const referrer = await User_1.default.findOne({ referralCode: user.referredBy }).session(session);
                    user.hasConverted = true;
                    user.credits = (user.credits ?? 0) + 2;
                    await user.save({ session });
                    if (referrer) {
                        referrer.credits = (referrer.credits ?? 0) + 2;
                        await referrer.save({ session });
                    }
                }
                else if (!user.hasConverted && !user.referredBy) {
                    user.hasConverted = true;
                    await user.save({ session });
                }
            });
            const refreshed = await User_1.default.findById(userId);
            return res.json({
                message: "Purchase recorded",
                credits: refreshed?.credits ?? 0,
                hasConverted: refreshed?.hasConverted ?? false,
            });
        }
        catch (err) {
            console.error("[purchase_v2] error:", err);
            if (err?.code === 404)
                return res.status(404).json({ message: err.message });
            return res.status(500).json({ message: "Purchase failed", details: String(err) });
        }
        finally {
            session.endSession();
        }
    };
    // register route with typed middleware + handler
    app.post("/purchase/buy", authHandler, purchaseHandler);
    console.log("Purchase route registered: POST /purchase/buy");
}
//# sourceMappingURL=purchase_v2.js.map
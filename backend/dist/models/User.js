"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/models/User.ts
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    referralCode: { type: String, required: true, index: true, unique: true },
    referredBy: { type: String, default: null },
    credits: { type: Number, default: 0 },
    hasConverted: { type: Boolean, default: false },
}, { timestamps: true });
/**
 * Synchronous pre-validate hook — do NOT accept or call `next`.
 * This avoids "next is not a function" errors with newer Mongoose hook behavior.
 */
userSchema.pre("validate", function () {
    if (!this.referralCode) {
        this.referralCode = Math.random().toString(36).slice(2, 9).toUpperCase();
    }
});
exports.default = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=User.js.map
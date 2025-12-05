import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    name?: string;
    email: string;
    password?: string;
    referralCode: string;
    referredBy?: string | null;
    credits: number;
    hasConverted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map
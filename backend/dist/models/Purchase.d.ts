import mongoose, { Document } from "mongoose";
export interface IPurchase extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    createdAt: Date;
}
declare const _default: mongoose.Model<IPurchase, {}, {}, {}, mongoose.Document<unknown, {}, IPurchase, {}, mongoose.DefaultSchemaOptions> & IPurchase & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IPurchase>;
export default _default;
//# sourceMappingURL=Purchase.d.ts.map
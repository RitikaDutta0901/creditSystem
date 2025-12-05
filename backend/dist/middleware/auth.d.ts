import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    userId?: string;
    userReferralCode?: string;
}
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>>;
export default requireAuth;
//# sourceMappingURL=auth.d.ts.map
import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string | undefined;
      userReferralCode?: string | undefined;
    }
  }
}

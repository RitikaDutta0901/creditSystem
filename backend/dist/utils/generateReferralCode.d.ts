/**
 * Generate a referral code synchronously.
 *
 * @param name Optional name used as prefix (first up to 4 alphanumeric chars).
 * @param length Total length of the resulting code (default 8). Must be >=3.
 */
export declare function generateReferralCode(name?: string, length?: number): string;
/**
 * Generate a unique referral code by calling an async `existsFn` to verify uniqueness.
 *
 * Usage:
 *   // existsFn should return true if the code already exists in DB
 *   const code = await generateUniqueReferralCode(async (c) => !!(await User.findOne({ referralCode: c })), name);
 *
 * @param existsFn async function that receives a code and returns true if the code already exists
 * @param name optional name for prefix
 * @param length desired total length (default 8)
 * @param maxAttempts how many times to try before throwing (default 10)
 */
export declare function generateUniqueReferralCode(existsFn: (code: string) => Promise<boolean>, name?: string, length?: number, maxAttempts?: number): Promise<string>;
//# sourceMappingURL=generateReferralCode.d.ts.map
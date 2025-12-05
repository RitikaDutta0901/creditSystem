// backend/src/utils/generateReferralCode.ts

/**
 * Generate a short referral code.
 *
 * Behavior:
 * - Optionally uses the `name` as a prefix (sanitized: letters & digits only).
 * - Appends a random alphanumeric part to reach the requested `length`.
 * - Always returns an uppercase string.
 *
 * This is a deterministic sync generator — it does NOT check the database for collisions.
 * Use `generateUniqueReferralCode` below if you want automatic uniqueness checking.
 */

const DEFAULT_LENGTH = 8;
const DEFAULT_PREFIX_LEN = 4;
const RANDOM_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Sanitize a name to be used as prefix: remove non-alphanumeric characters and uppercase.
 */
function sanitizePrefix(name?: string, maxLen = DEFAULT_PREFIX_LEN) {
  if (!name) return "";
  const cleaned = String(name).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, maxLen);
}

/**
 * Return a random string of given length from the charset.
 */
function randomString(len: number, charset = RANDOM_CHARSET) {
  let out = "";
  const charsLen = charset.length;
  for (let i = 0; i < len; i++) {
    const idx = Math.floor(Math.random() * charsLen);
    out += charset[idx];
  }
  return out;
}

/**
 * Generate a referral code synchronously.
 *
 * @param name Optional name used as prefix (first up to 4 alphanumeric chars).
 * @param length Total length of the resulting code (default 8). Must be >=3.
 */
export function generateReferralCode(name?: string, length = DEFAULT_LENGTH): string {
  if (!Number.isInteger(length) || length < 3) {
    throw new Error("length must be an integer >= 3");
  }

  const prefix = sanitizePrefix(name, DEFAULT_PREFIX_LEN); // up to 4 chars
  const remaining = Math.max(1, length - prefix.length);
  const rand = randomString(remaining);
  return (prefix + rand).slice(0, length).toUpperCase();
}

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
export async function generateUniqueReferralCode(
  existsFn: (code: string) => Promise<boolean>,
  name?: string,
  length = DEFAULT_LENGTH,
  maxAttempts = 10
): Promise<string> {
  if (typeof existsFn !== "function") {
    throw new Error("existsFn must be a function");
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateReferralCode(name, length);
    const exists = await existsFn(candidate);
    if (!exists) return candidate;
    // slightly vary by increasing random part length on later attempts
    // (not necessary but reduces collision chance if DB is crowded)
  }

  throw new Error(`Failed to generate unique referral code after ${maxAttempts} attempts`);
}

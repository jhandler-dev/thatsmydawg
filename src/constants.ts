// That's My Dawg — POC business rules & limits.
// Never hardcode these values inline elsewhere — import from here.

/** Default retail price in cents ($39.99). Per-scene override lives on Scene.priceCents. */
export const DEFAULT_PRICE_CENTS = 3999;

/** Oversized tee size run. */
export const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"] as const;
export type Size = (typeof SIZES)[number];

/** Max uploaded dog photo size, in megabytes. */
export const MAX_UPLOAD_MB = 10;

/** Accepted upload MIME types. */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Free AI proofs per session before an order is required. */
export const MAX_FREE_PROOFS_PER_SESSION = 3;

/** Per-IP rate limit on /api/generate (requests per minute). */
export const GENERATE_RATE_PER_MIN = 6;

/** fal.ai model id for the dog swap (POC: cheap Gemini 2.5 Flash Image edit). */
export const FAL_MODEL_ID = "fal-ai/gemini-25-flash-image/edit";

/** Currency. */
export const CURRENCY = "usd";

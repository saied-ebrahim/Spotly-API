// Auth Constants
export const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds
export const MAX_REFRESH_TOKENS_PER_USER = 5; // Maximum number of devices per user

// Cookie Options
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: "strict",
  maxAge: COOKIE_MAX_AGE,
});


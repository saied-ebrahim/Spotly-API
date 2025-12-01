// Auth Constants
export const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
export const MAX_REFRESH_TOKENS_PER_USER = 5;

// Cookie Options
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: COOKIE_MAX_AGE,
});

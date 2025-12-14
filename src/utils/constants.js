// Auth Constants
export const COOKIE_MAX_AGE = 1 * 24 * 60 * 60 * 1000;
export const MAX_REFRESH_TOKENS_PER_USER = 5;

// Cookie Options
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: COOKIE_MAX_AGE,
});





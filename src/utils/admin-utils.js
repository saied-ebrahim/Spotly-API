/**
 * Utility functions for admin role checks
 */

/**
 * Check if user has admin role
 * @param {Object} user - User object from req.user
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  return user && user.role === "admin";
};

/**
 * Check if request is made by admin
 * @param {Object} req - Express request object
 * @returns {boolean} - True if request is from admin
 */
export const isAdminRequest = (req) => {
  return req.user && req.user.role === "admin";
};

/**
 * Get admin access flag from request
 * @param {Object} req - Express request object
 * @returns {boolean} - True if admin access is granted
 */
export const hasAdminAccess = (req) => {
  return req.isAdmin === true || isAdminRequest(req);
};

/**
 * Check if user is authenticated by verifying session cookie
 * @param {Object} context - GraphQL context containing request object
 * @returns {Object} User session data
 * @throws {Error} If user is not authenticated
 */
const checkAuth = (context) => {
  // Get user session from cookies
  const userSession = context.req.cookies.session;

  if (!userSession) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    // Parse the session data
    const sessionData = JSON.parse(userSession);
    return sessionData;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new Error("Invalid session. Please log in again.");
  }
};

/**
 * Set session cookie with user data
 * @param {Object} res - Express response object
 * @param {Object} userData - User data to store in session
 * @param {Number} maxAge - Cookie max age in milliseconds
 */
const setSessionCookie = (res, userData, maxAge = 24 * 60 * 60 * 1000) => {
  // Create a session object with user data
  const sessionData = {
    userId: userData._id || userData.id,
    role: userData.role,
    name: userData.name,
  };

  // Set the session cookie
  res.cookie("session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge,
    sameSite: "lax",
    path: "/",
  });
};

/**
 * Clear session cookie
 * @param {Object} res - Express response object
 */
const clearSessionCookie = (res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

module.exports = {
  checkAuth,
  setSessionCookie,
  clearSessionCookie,
};

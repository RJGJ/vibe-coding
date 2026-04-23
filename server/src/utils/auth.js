/**
 * Authentication Utility
 * Simulated Google OAuth for MVP (can be extended with real OAuth later)
 */

const verifyGoogleToken = async (token) => {
  try {
    // In production, verify token with Google's tokeninfo endpoint
    // For MVP, we'll use a simple validation
    if (!token || token.length < 10) {
      throw new Error("Invalid token");
    }

    // Simulate user data extraction from token
    const userId = `user_${Date.now()}`;
    const userName = `User_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      userId,
      userName,
      email: `${userName}@example.com`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

const generateToken = (userData) => {
  // Simple JWT-like token (in production, use jsonwebtoken library)
  const payload = Buffer.from(JSON.stringify(userData)).toString("base64");
  return `${payload}.${Date.now()}`;
};

const verifyToken = (token) => {
  try {
    const [payload] = token.split(".");
    const userData = JSON.parse(Buffer.from(payload, "base64").toString());
    return { success: true, userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { verifyGoogleToken, generateToken, verifyToken };

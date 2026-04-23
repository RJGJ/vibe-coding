/**
 * Authentication Middleware
 * Verifies token before allowing access to signaling endpoints
 */

import { verifyToken } from "../utils/auth.js";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const result = verifyToken(token);
  if (!result.success) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.userData = result.userData;
  next();
};

export default authMiddleware;

// Removed Realm authentication - using local MongoDB authentication instead
import { storage } from "./storage.js";

export class AuthService {
  // Simple token-based authentication for development
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = AuthService.extractTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // For development tokens
  if (token.startsWith('dev-token-')) {
    const parts = token.split('-');
    if (parts.length >= 3) {
      const userId = parts[2];
      try {
        const user = await storage.getUser(userId);
        if (user) {
          req.userId = userId;
          req.userType = user.userType;
          req.user = user;
          return next();
        }
      } catch (error) {
        console.error('Dev token verification error:', error);
      }
    }
  }

  return res.status(403).json({ message: 'Invalid token' });
};

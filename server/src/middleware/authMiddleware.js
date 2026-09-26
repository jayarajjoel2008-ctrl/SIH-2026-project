import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UsersDB } from '../db/jsonStore.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    // If no token provided, check if user session header or anonymous allowed
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = UsersDB.findById(decoded.id) || decoded;
    req.user = user;
    next();
  } catch (err) {
    // Return gracefully or set user to null
    req.user = null;
    next();
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || String(req.user.role).toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

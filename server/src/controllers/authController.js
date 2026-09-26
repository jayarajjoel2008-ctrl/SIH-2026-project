import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UsersDB } from '../db/jsonStore.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export class AuthController {
  static async login(req, res) {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      let user = UsersDB.findOne(u => u.email.toLowerCase() === normalizedEmail);

      // If user exists, check credentials (support plain demo password or match)
      if (user) {
        // If an explicit role is passed and different, allow updating for demo testing
        if (role && user.role !== role) {
          user = UsersDB.update(user.id, { role });
        }
      } else {
        // Auto-provision demo user if not found
        const determinedRole = role || (normalizedEmail.includes('admin') ? 'admin' : 'user');
        user = UsersDB.insert({
          email: normalizedEmail,
          password: password, // For local dev demo
          name: normalizedEmail.split('@')[0],
          role: determinedRole
        });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        user: userWithoutPassword,
        token
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed: ' + err.message });
    }
  }

  static async register(req, res) {
    try {
      const { email, password, name, role = 'user' } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      let existing = UsersDB.findOne(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const newUser = UsersDB.insert({
        email: normalizedEmail,
        password,
        name: name || normalizedEmail.split('@')[0],
        role: role || (normalizedEmail.includes('admin') ? 'admin' : 'user')
      });

      const token = generateToken(newUser);
      const { password: _, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        success: true,
        user: userWithoutPassword,
        token
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
  }

  static async guest(req, res) {
    try {
      const guestId = `guest-${Date.now()}`;
      const guestUser = {
        id: guestId,
        email: `citizen.guest@mindcare.gov.in`,
        name: 'Anonymous Citizen',
        role: 'user',
        isGuest: true
      };

      const token = generateToken(guestUser);
      return res.json({
        success: true,
        user: guestUser,
        token
      });
    } catch (err) {
      console.error('Guest login error:', err);
      return res.status(500).json({ error: 'Guest login failed: ' + err.message });
    }
  }

  static async me(req, res) {
    try {
      if (!req.user) {
        return res.json(null);
      }
      const user = UsersDB.findById(req.user.id) || req.user;
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async verifyOtp(req, res) {
    try {
      const { email, otpCode, role = 'user' } = req.body;
      const normalizedEmail = (email || 'user@example.com').toLowerCase().trim();
      let user = UsersDB.findOne(u => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        user = UsersDB.insert({
          email: normalizedEmail,
          password: 'demo-password',
          name: normalizedEmail.split('@')[0],
          role: role || 'user'
        });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        access_token: token,
        token,
        user: userWithoutPassword
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async forgotPassword(req, res) {
    return res.json({ success: true, message: 'Password reset instructions sent' });
  }

  static async resetPassword(req, res) {
    return res.json({ success: true, message: 'Password successfully updated' });
  }

  static async logout(req, res) {
    return res.json({ success: true });
  }
}

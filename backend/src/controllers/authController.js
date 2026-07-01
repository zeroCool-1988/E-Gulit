const User = require('../models/UserModel');
const bcrypt = require('../utils/bcryptUtil');
const jwt = require('../utils/jwtUtil');
const log = require('../config/logger');

const auth = {
  async register(req, res) {
    const { username, email, password, role, phone_number } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    try {
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }

      const hashed = await bcrypt.hashPassword(password);
      const user = await User.create({
        username,
        email,
        password_hash: hashed,
        account_role: role,
        phone_number,
      });

      const payload = { id: user.id, username: user.username, role: user.account_role };
      const accessToken = jwt.generateAccessToken(payload);
      const refreshToken = jwt.generateRefreshToken(payload);

      log.info(`User registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.account_role,
            phone: user.phone_number,
            verified: user.is_verified_seller,
            balance: user.wallet_balance,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      log.error(`Registration failed: ${err.message}`);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const valid = await bcrypt.comparePassword(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const payload = { id: user.id, username: user.username, role: user.account_role };
      const accessToken = jwt.generateAccessToken(payload);
      const refreshToken = jwt.generateRefreshToken(payload);

      log.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.account_role,
            phone: user.phone_number,
            verified: user.is_verified_seller,
            balance: user.wallet_balance,
            store: user.store_name || null,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      log.error(`Login failed: ${err.message}`);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  },

  async profile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.account_role,
          phone: user.phone_number,
          verified: user.is_verified_seller,
          balance: user.wallet_balance,
          store: user.store_name || null,
          rating: user.rating || null,
        },
      });
    } catch (err) {
      log.error(`Profile error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
  },

  async refresh(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    try {
      const decoded = jwt.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const payload = { id: user.id, username: user.username, role: user.account_role };
      const newAccessToken = jwt.generateAccessToken(payload);

      res.json({ success: true, data: { accessToken: newAccessToken } });
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  },
};

module.exports = auth;
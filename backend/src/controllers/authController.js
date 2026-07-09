const User = require('../models/UserModel');
const bcrypt = require('../utils/bcryptUtil');
const jwt = require('../utils/jwtUtil');
const log = require('../config/logger');
const { sendEmail } = require('../services/emailService');
const { generateToken } = require('../utils/tokenUtil');

const auth = {
  async register(req, res) {
    const { username, email, password, role, phone_number, full_name, store_name, stall_location } = req.body;

    if (!username || !email || !password || !role || !full_name) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const allowedRoles = ['buyer', 'seller'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be buyer or seller.' });
    }

    const finalRole = (role === 'seller') ? 'seller' : 'buyer';

    try {
      const normalizedUsername = username.trim();
      const normalizedFullName = full_name.trim();
      const normalizedPhone = phone_number?.trim();
      const firstName = normalizedFullName.split(/\s+/)[0] || normalizedUsername;
      const defaultStoreName = `${firstName}'s Store`;

      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }

      const existingUsername = await User.findByUsername(normalizedUsername);
      if (existingUsername) {
        return res.status(409).json({ success: false, message: 'Username already taken' });
      }

      const hashed = await bcrypt.hashPassword(password);
      const user = await User.create({
        username: normalizedUsername,
        email,
        password_hash: hashed,
        full_name: normalizedFullName,
        account_role: finalRole,
        phone_number: normalizedPhone,
        store_name: finalRole === 'seller' ? store_name?.trim() || defaultStoreName : null,
        stall_location: finalRole === 'seller' ? stall_location?.trim() || null : null,
      });

      const token = generateToken();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await User.setVerificationToken(user.id, token, expires);
      const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify/${token}`;
      await sendEmail(
        email,
        'Verify your E-Gulit account',
        `
          <h2>Welcome to E-Gulit!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:4px;">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't create an account, you can ignore this email.</p>
        `
      );

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
            full_name: user.full_name,
            fullName: user.full_name,
            firstName: user.full_name?.split(/\s+/)[0] || user.username,
            verified: user.is_verified_seller,
            isEmailVerified: Boolean(user.is_email_verified),
            emailVerified: Boolean(user.is_email_verified),
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

  async checkUsername(req, res) {
    const username = req.query.username?.trim();

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    if (!/^[A-Za-z._]{4,}$/.test(username)) {
      return res.json({ success: true, available: false, message: 'Username must be at least 4 characters and contain only letters, dots, or underscores' });
    }

    try {
      const existing = await User.findByUsername(username);
      return res.json({ success: true, available: !existing });
    } catch (err) {
      log.error(`Username check error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Could not check username' });
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
            full_name: user.full_name,
            fullName: user.full_name,
            firstName: user.full_name?.split(/\s+/)[0] || user.username,
            verified: user.is_verified_seller,
            isEmailVerified: Boolean(user.is_email_verified),
            emailVerified: Boolean(user.is_email_verified),
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
          full_name: user.full_name,
          fullName: user.full_name,
          firstName: user.full_name?.split(/\s+/)[0] || user.username,
          verified: user.is_verified_seller,
          isEmailVerified: Boolean(user.is_email_verified),
          emailVerified: Boolean(user.is_email_verified),
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

  async verify(req, res) {
    const { token } = req.params;
    try {
      const user = await User.verifyEmail(token);
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
      }
      res.json({ success: true, message: 'Email verified successfully' });
    } catch (err) {
      log.error(`Verify error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Verification failed' });
    }
  },

  async resendVerification(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    try {
      const user = await User.findByEmail(email);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (user.is_email_verified) return res.status(400).json({ success: false, message: 'Already verified' });

      const token = generateToken();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await User.setVerificationToken(user.id, token, expires);
      const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify/${token}`;
      await sendEmail(
        email,
        'Verify your E-Gulit account',
        `
          <h2>Email Verification</h2>
          <p>Click the button below to verify your email:</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:4px;">Verify Email</a>
          <p>Or copy this link: ${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
        `
      );
      res.json({ success: true, message: 'Verification email sent' });
    } catch (err) {
      log.error(`Resend verification error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to send' });
    }
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    try {
      const user = await User.findByEmail(email);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const token = generateToken();
      const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
      await User.setResetToken(user.id, token, expires);
      const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password/${token}`;
      await sendEmail(
        email,
        'Reset your E-Gulit password',
        `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#2196F3;color:white;text-decoration:none;border-radius:4px;">Reset Password</a>
          <p>Or copy this link: ${resetUrl}</p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, ignore this email.</p>
        `
      );
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (err) {
      log.error(`Forgot password error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to send' });
    }
  },

  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password required' });
    try {
      const hashed = await bcrypt.hashPassword(newPassword);
      const user = await User.resetPassword(token, hashed);
      if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      log.error(`Reset password error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Reset failed' });
    }
  },
};

module.exports = auth;
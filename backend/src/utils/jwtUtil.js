const jwt = require('jsonwebtoken');
const log = require('../config/logger');

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExpiry = process.env.JWT_ACCESS_EXPIRY || '60m';
const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

const generateAccessToken = (payload) => {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiry });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiry });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, accessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
const { verifyAccessToken } = require('../utils/jwtUtil');
const log = require('../config/logger');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    next();
  } catch (err) {
    log.warn(`Auth failed: ${err.message}`);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
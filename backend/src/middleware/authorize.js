const log = require('../config/logger');

module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Auth required' });
    }

    if (!roles.includes(req.user.role)) {
      log.warn(`User ${req.user.username} tried ${req.user.role} but needs ${roles.join(',')}`);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    next();
  };
};
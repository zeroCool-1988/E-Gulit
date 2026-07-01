const bcrypt = require('bcrypt');
const log = require('../config/logger');

const saltRounds = 12;

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    log.error(`Hash error: ${err.message}`);
    throw err;
  }
};

const comparePassword = async (plain, hashed) => {
  try {
    return await bcrypt.compare(plain, hashed);
  } catch (err) {
    log.error(`Compare error: ${err.message}`);
    throw err;
  }
};

module.exports = { hashPassword, comparePassword };
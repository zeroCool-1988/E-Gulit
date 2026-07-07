const pool = require('../config/database');
const log = require('../config/logger');

const Category = {
  async findAll() {
    try {
      const result = await pool.query(
        `SELECT id, category_name, description, parent_category_id, created_at
         FROM categories
         ORDER BY category_name ASC`
      );
      return result.rows;
    } catch (err) {
      log.error(`Category findAll error: ${err.message}`);
      throw err;
    }
  },
};

module.exports = Category;

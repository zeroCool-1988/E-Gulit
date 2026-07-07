const pool = require('../config/database');
const log = require('../config/logger');

const Review = {
  async create(data) {
    const { product_id, user_id, rating, comment } = data;
    try {
      const r = await pool.query(
        `INSERT INTO reviews (product_id, user_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [product_id, user_id, rating, comment || null]
      );
      log.info(`Review created for product ${product_id}`);
      return r.rows[0];
    } catch (e) {
      log.error(`Review create error: ${e.message}`);
      throw e;
    }
  },

  async findByProduct(productId) {
    try {
      const r = await pool.query(
        `SELECT r.*, u.username
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = $1
         ORDER BY r.created_at DESC`,
        [productId]
      );
      return r.rows;
    } catch (e) {
      log.error(`Review findByProduct error: ${e.message}`);
      throw e;
    }
  },

  async findByUser(userId) {
    try {
      const r = await pool.query(
        `SELECT r.*, p.product_name
         FROM reviews r
         JOIN products p ON r.product_id = p.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC`,
        [userId]
      );
      return r.rows;
    } catch (e) {
      log.error(`Review findByUser error: ${e.message}`);
      throw e;
    }
  },

  async findById(id) {
    try {
      const r = await pool.query(
        `SELECT r.*, u.username, p.product_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         JOIN products p ON r.product_id = p.id
         WHERE r.id = $1`,
        [id]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Review findById error: ${e.message}`);
      throw e;
    }
  },

  async delete(id, userId) {
    try {
      const r = await pool.query(
        'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Review delete error: ${e.message}`);
      throw e;
    }
  },

  async getAverageRating(productId) {
    try {
      const r = await pool.query(
        'SELECT AVG(rating)::DECIMAL(10,2) as avg, COUNT(*) as count FROM reviews WHERE product_id = $1',
        [productId]
      );
      return r.rows[0];
    } catch (e) {
      log.error(`Review getAverageRating error: ${e.message}`);
      throw e;
    }
  }
};

module.exports = Review;
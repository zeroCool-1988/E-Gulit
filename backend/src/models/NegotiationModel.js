const pool = require('../config/database');
const log = require('../config/logger');

const Negotiation = {
  async create(data) {
    const { product_id, buyer_id, seller_id, offered_price, buyer_message } = data;
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 48);

    try {
      const r = await pool.query(
        `INSERT INTO negotiations 
         (product_id, buyer_id, seller_id, offered_price, buyer_message, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [product_id, buyer_id, seller_id, offered_price, buyer_message || null, expires_at]
      );
      log.info(`Negotiation created: ${r.rows[0].id}`);
      return r.rows[0];
    } catch (e) {
      log.error(`Negotiation create: ${e.message}`);
      throw e;
    }
  },

  async findById(id) {
    try {
      const r = await pool.query(
        `SELECT n.*, 
                p.product_name, p.price,
                b.username as buyer_name, b.email as buyer_email,
                s.username as seller_name, s.email as seller_email,
                sp.store_name
         FROM negotiations n
         JOIN products p ON n.product_id = p.id
         JOIN users b ON n.buyer_id = b.id
         JOIN users s ON n.seller_id = s.id
         LEFT JOIN seller_profiles sp ON s.id = sp.user_id
         WHERE n.id = $1`,
        [id]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Negotiation findById: ${e.message}`);
      throw e;
    }
  },

  async findByProduct(productId, buyerId) {
    try {
      const r = await pool.query(
        `SELECT * FROM negotiations 
         WHERE product_id = $1 AND buyer_id = $2 
         AND status IN ('pending', 'countered')
         ORDER BY created_at DESC LIMIT 1`,
        [productId, buyerId]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Negotiation findByProduct: ${e.message}`);
      throw e;
    }
  },

  async getForSeller(sellerId) {
    try {
      const r = await pool.query(
        `SELECT n.*, p.product_name, u.username as buyer_name
         FROM negotiations n
         JOIN products p ON n.product_id = p.id
         JOIN users u ON n.buyer_id = u.id
         WHERE n.seller_id = $1 
         AND n.status IN ('pending', 'countered')
         ORDER BY n.created_at DESC`,
        [sellerId]
      );
      return r.rows;
    } catch (e) {
      log.error(`Negotiation getForSeller: ${e.message}`);
      throw e;
    }
  },

  async getForBuyer(buyerId) {
    try {
      const r = await pool.query(
        `SELECT n.*, p.product_name, u.username as seller_name
         FROM negotiations n
         JOIN products p ON n.product_id = p.id
         JOIN users u ON n.seller_id = u.id
         WHERE n.buyer_id = $1
         ORDER BY n.created_at DESC`,
        [buyerId]
      );
      return r.rows;
    } catch (e) {
      log.error(`Negotiation getForBuyer: ${e.message}`);
      throw e;
    }
  },

  async accept(id) {
    try {
      const r = await pool.query(
        'UPDATE negotiations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['accepted', id]
      );
      log.info(`Negotiation accepted: ${id}`);
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Negotiation accept: ${e.message}`);
      throw e;
    }
  },

  async counter(id, price, message) {
    try {
      const r = await pool.query(
        `UPDATE negotiations 
         SET status = 'countered', 
             counter_price = $1, 
             seller_message = $2,
             counter_round = counter_round + 1,
             expires_at = CURRENT_TIMESTAMP + INTERVAL '48 hours',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 
         RETURNING *`,
        [price, message || null, id]
      );
      log.info(`Negotiation countered: ${id}`);
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Negotiation counter: ${e.message}`);
      throw e;
    }
  },

  async reject(id) {
    try {
      const r = await pool.query(
        'UPDATE negotiations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['rejected', id]
      );
      log.info(`Negotiation rejected: ${id}`);
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Negotiation reject: ${e.message}`);
      throw e;
    }
  },

  async expire(id) {
    try {
      const r = await pool.query(
        'UPDATE negotiations SET status = $1 WHERE id = $2 RETURNING *',
        ['expired', id]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Negotiation expire: ${e.message}`);
      throw e;
    }
  }
};

module.exports = Negotiation;
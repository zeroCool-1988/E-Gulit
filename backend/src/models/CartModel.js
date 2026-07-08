const pool = require('../config/database');
const log = require('../config/logger');

const Cart = {
  async get(userId) {
    try {
      const result = await pool.query(
        `SELECT c.id, c.product_id, c.quantity, c.negotiated_price,
                p.product_name, p.price, p.images, p.seller_id,  -- 👈 added p.seller_id
                u.username as seller_name, sp.store_name
        FROM cart c
        JOIN products p ON c.product_id = p.id
        LEFT JOIN users u ON p.seller_id = u.id
        LEFT JOIN seller_profiles sp ON u.id = sp.user_id
        WHERE c.user_id = $1
        ORDER BY c.added_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      log.error(`getCart error: ${err.message}`);
      throw err;
    }
  },

  async add(userId, productId, qty = 1) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query(
        'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      let r;
      if (existing.rows.length > 0) {
        r = await client.query(
          'UPDATE cart SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
          [qty, existing.rows[0].id]
        );
      } else {
        r = await client.query(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
          [userId, productId, qty]
        );
      }
      await client.query('COMMIT');
      return r.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      log.error(`cart add: ${e.message}`);
      throw e;
    } finally {
      client.release();
    }
  },

  async update(itemId, userId, qty) {
    try {
      const r = await pool.query(
        'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [qty, itemId, userId]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`cart update: ${e.message}`);
      throw e;
    }
  },

  async remove(itemId, userId) {
    try {
      const r = await pool.query(
        'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
        [itemId, userId]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`cart remove: ${e.message}`);
      throw e;
    }
  },

  async clear(userId) {
    try {
      await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);
    } catch (e) {
      log.error(`cart clear: ${e.message}`);
      throw e;
    }
  },

  async setNegotiatedPrice(itemId, userId, price) {
    try {
      const r = await pool.query(
        'UPDATE cart SET negotiated_price = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [price, itemId, userId]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`cart setNegotiatedPrice: ${e.message}`);
      throw e;
    }
  }
};

module.exports = Cart;
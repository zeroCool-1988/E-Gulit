const pool = require('../config/database');
const log = require('../config/logger');

const Order = {
  async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const r = await client.query(
        `INSERT INTO orders 
         (user_id, order_ref, subtotal, commission, delivery, total, seller_payout, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [data.user_id, data.order_ref, data.subtotal, data.commission, data.delivery, data.total, data.seller_payout, data.address]
      );

      for (const item of data.items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, seller_id, qty, price)
           VALUES ($1, $2, $3, $4, $5)`,
          [r.rows[0].id, item.product_id, item.seller_id, item.qty, item.price]
        );
      }

      await client.query('COMMIT');
      log.info(`Order created: ${r.rows[0].order_ref}`);
      return r.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      log.error(`Order create: ${e.message}`);
      throw e;
    } finally {
      client.release();
    }
  },

  async findById(id) {
    try {
      const r = await pool.query(
        `SELECT o.*, u.username, u.email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [id]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Order findById: ${e.message}`);
      throw e;
    }
  },

  async findByRef(ref) {
    try {
      const r = await pool.query(
        `SELECT o.*, u.username, u.email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.order_ref = $1`,
        [ref]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Order findByRef: ${e.message}`);
      throw e;
    }
  },

  async getItems(orderId) {
    try {
      const r = await pool.query(
        `SELECT oi.*, p.product_name, p.seller_id
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1`,
        [orderId]
      );
      return r.rows;
    } catch (e) {
      log.error(`Order getItems: ${e.message}`);
      throw e;
    }
  },

  async getForUser(userId) {
    try {
      const r = await pool.query(
        `SELECT o.*, 
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
         FROM orders o
         WHERE o.user_id = $1
         ORDER BY o.created_at DESC`,
        [userId]
      );
      return r.rows;
    } catch (e) {
      log.error(`Order getForUser: ${e.message}`);
      throw e;
    }
  },

  async getForSeller(sellerId) {
    try {
      const r = await pool.query(
        `SELECT DISTINCT o.*, 
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id AND seller_id = $1) as my_items
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE oi.seller_id = $1
         ORDER BY o.created_at DESC`,
        [sellerId]
      );
      return r.rows;
    } catch (e) {
      log.error(`Order getForSeller: ${e.message}`);
      throw e;
    }
  },

  async getAll() {
    try {
      const r = await pool.query(
        `SELECT o.*, u.username
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC`
      );
      return r.rows;
    } catch (e) {
      log.error(`Order getAll: ${e.message}`);
      throw e;
    }
  },

  async updateStatus(id, status) {
    try {
      const r = await pool.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );
      log.info(`Order ${id} status: ${status}`);
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Order updateStatus: ${e.message}`);
      throw e;
    }
  },

  async updatePayment(id, status, ref) {
    try {
      const r = await pool.query(
        'UPDATE orders SET payment_status = $1, chapa_ref = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [status, ref, id]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Order updatePayment: ${e.message}`);
      throw e;
    }
  },

  async updateSettlement(id, status) {
    try {
      const r = await pool.query(
        'UPDATE orders SET settlement = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`Order updateSettlement: ${e.message}`);
      throw e;
    }
  },

  async updateChapaRef(id, ref) {
    try {
      const r = await pool.query(
        'UPDATE orders SET chapa_ref = $1 WHERE id = $2 RETURNING *',
        [ref, id]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`updateChapaRef error: ${e.message}`);
      throw e;
    }
  },

  async findByChapaRef(ref) {
    try {
      const r = await pool.query(
        'SELECT * FROM orders WHERE chapa_ref = $1',
        [ref]
      );
      return r.rows[0] || null;
    } catch (e) {
      log.error(`findByChapaRef error: ${e.message}`);
      throw e;
    }
  }
};

module.exports = Order;
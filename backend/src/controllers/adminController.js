const pool = require('../config/database');
const User = require('../models/UserModel');
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const log = require('../config/logger');

const admin = {
  async getUsers(req, res) {
    try {
      const r = await pool.query(
        `SELECT id, username, email, account_role, is_verified_seller, 
                wallet_balance, created_at 
         FROM users 
         ORDER BY created_at DESC`
      );
      res.json({ success: true, data: r.rows });
    } catch (e) {
      log.error(`Admin getUsers error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  },

  async getProducts(req, res) {
    try {
      const r = await pool.query(
        `SELECT p.*, u.username as seller_name 
         FROM products p
         JOIN users u ON p.seller_id = u.id
         ORDER BY p.created_at DESC`
      );
      res.json({ success: true, data: r.rows });
    } catch (e) {
      log.error(`Admin getProducts error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
  },

  async getOrders(req, res) {
    try {
      const r = await pool.query(
        `SELECT o.*, u.username 
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC`
      );
      res.json({ success: true, data: r.rows });
    } catch (e) {
      log.error(`Admin getOrders error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
  },

  async getStats(req, res) {
    try {
      const users = await pool.query('SELECT COUNT(*) FROM users');
      const products = await pool.query('SELECT COUNT(*) FROM products');
      const orders = await pool.query('SELECT COUNT(*) FROM orders');
      const revenue = await pool.query('SELECT SUM(total) FROM orders WHERE payment_status = $1', ['paid']);
      
      res.json({
        success: true,
        data: {
          users: parseInt(users.rows[0].count),
          products: parseInt(products.rows[0].count),
          orders: parseInt(orders.rows[0].count),
          revenue: parseFloat(revenue.rows[0].sum || 0),
        }
      });
    } catch (e) {
      log.error(`Admin getStats error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  },

  async verifySeller(req, res) {
    const { id } = req.params;
    try {
      const user = await User.verifySeller(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (e) {
      log.error(`Admin verifySeller error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to verify seller' });
    }
  },

  async deleteProduct(req, res) {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      res.json({ success: true, message: 'Product deleted' });
    } catch (e) {
      log.error(`Admin deleteProduct error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
  }
};

module.exports = admin;

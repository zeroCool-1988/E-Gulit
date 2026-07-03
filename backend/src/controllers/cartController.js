const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const log = require('../config/logger');

const cart = {
  async get(req, res) {
    try {
      const items = await Cart.get(req.user.id);
      const total = items.reduce((s, i) => {
        const p = i.negotiated_price || i.price;
        return s + (p * i.quantity);
      }, 0);
      res.json({ success: true, data: { items, total } });
    } catch (e) {
      log.error(`cart get: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get cart' });
    }
  },

  async add(req, res) {
    const { product_id, quantity } = req.body;
    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }
    try {
      const p = await Product.findById(product_id);
      if (!p) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      if (p.quantity_in_stock <= 0) {
        return res.status(400).json({ success: false, message: 'Out of stock' });
      }
      const item = await Cart.add(req.user.id, product_id, quantity || 1);
      res.status(201).json({ success: true, data: item });
    } catch (e) {
      log.error(`cart add: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to add to cart' });
    }
  },

  async update(req, res) {
    const { item_id } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity required' });
    }
    try {
      if (quantity === 0) {
        const d = await Cart.remove(item_id, req.user.id);
        if (!d) {
          return res.status(404).json({ success: false, message: 'Item not found' });
        }
        return res.json({ success: true, message: 'Item removed' });
      }
      const item = await Cart.update(item_id, req.user.id, quantity);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      res.json({ success: true, data: item });
    } catch (e) {
      log.error(`cart update: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
  },

  async remove(req, res) {
    const { item_id } = req.params;
    try {
      const d = await Cart.remove(item_id, req.user.id);
      if (!d) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      res.json({ success: true, message: 'Item removed' });
    } catch (e) {
      log.error(`cart remove: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to remove item' });
    }
  }
};

module.exports = cart;
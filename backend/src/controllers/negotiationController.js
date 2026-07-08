const pool = require('../config/database');
const Negotiation = require('../models/NegotiationModel');
const Product = require('../models/ProductModel');
const log = require('../config/logger');

const negotiation = {
  async create(req, res) {
    const { product_id, offered_price, message } = req.body;

    if (!product_id || !offered_price) {
      return res.status(400).json({ success: false, message: 'Product ID and price required' });
    }

    try {
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (!product.is_negotiable) {
        return res.status(400).json({ success: false, message: 'This product is not negotiable' });
      }

      if (offered_price >= product.price) {
        return res.status(400).json({ success: false, message: 'Offer must be lower than asking price' });
      }

      const existing = await Negotiation.findByProduct(product_id, req.user.id);
      if (existing) {
        return res.status(409).json({ success: false, message: 'You already have a pending negotiation on this product' });
      }

      const neg = await Negotiation.create({
        product_id,
        buyer_id: req.user.id,
        seller_id: product.seller_id,
        offered_price,
        buyer_message: message || null
      });

      res.status(201).json({ success: true, data: neg });
    } catch (e) {
      log.error(`Negotiation create error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to create negotiation' });
    }
  },

  async getById(req, res) {
    const { id } = req.params;

    try {
      const neg = await Negotiation.findById(id);
      if (!neg) {
        return res.status(404).json({ success: false, message: 'Negotiation not found' });
      }

      if (neg.buyer_id !== req.user.id && neg.seller_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({ success: true, data: neg });
    } catch (e) {
      log.error(`Negotiation getById error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get negotiation' });
    }
  },

  async getForSeller(req, res) {
    try {
      const negs = await Negotiation.getForSeller(req.user.id);
      res.json({ success: true, data: negs });
    } catch (e) {
      log.error(`Negotiation getForSeller error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get negotiations' });
    }
  },

  async getForBuyer(req, res) {
    try {
      const negs = await Negotiation.getForBuyer(req.user.id);
      res.json({ success: true, data: negs });
    } catch (e) {
      log.error(`Negotiation getForBuyer error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get negotiations' });
    }
  },

  async respond(req, res) {
  const { id } = req.params;
  const { action, counter_price, message } = req.body;

  if (!action || !['accept', 'counter', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be accept, counter, or reject' });
  }

  try {
    const neg = await Negotiation.findById(id);
    if (!neg) {
      return res.status(404).json({ success: false, message: 'Negotiation not found' });
    }

    if (neg.buyer_id !== req.user.id && neg.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (action === 'counter' || action === 'reject') {
      if (neg.seller_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Only seller can counter or reject' });
      }
    }

    if (action === 'accept') {
      // Both can accept
    }

    if (neg.status === 'expired') {
      return res.status(400).json({ success: false, message: 'Negotiation has expired' });
    }

    if (neg.status === 'accepted' || neg.status === 'rejected') {
      return res.status(400).json({ success: false, message: `Already ${neg.status}` });
    }

    if (neg.counter_round >= 3 && action === 'counter') {
      return res.status(400).json({ success: false, message: 'Maximum counter rounds reached' });
    }

    let result;

    if (action === 'accept') {
      const finalPrice = neg.counter_price || neg.offered_price;
      
      result = await Negotiation.accept(id);
      
      const cartCheck = await pool.query(
        'SELECT id FROM cart WHERE user_id = $1 AND product_id = $2',
        [neg.buyer_id, neg.product_id]
      );
      
      if (cartCheck.rows.length > 0) {
        await pool.query(
          'UPDATE cart SET quantity = quantity + 1, negotiated_price = $1 WHERE user_id = $2 AND product_id = $3',
          [finalPrice, neg.buyer_id, neg.product_id]
        );
      } else {
        await pool.query(
          'INSERT INTO cart (user_id, product_id, quantity, negotiated_price) VALUES ($1, $2, 1, $3)',
          [neg.buyer_id, neg.product_id, finalPrice]
        );
      }
      
      log.info(`Negotiation accepted: ${id} at ${finalPrice}`);
    } else if (action === 'counter') {
      if (!counter_price) {
        return res.status(400).json({ success: false, message: 'Counter price required' });
      }
      const prod = await pool.query('SELECT price FROM products WHERE id = $1', [neg.product_id]);
      if (counter_price >= prod.rows[0].price) {
        return res.status(400).json({ success: false, message: 'Counter price must be lower than asking price' });
      }
      result = await Negotiation.counter(id, counter_price, message);
    } else {
      result = await Negotiation.reject(id);
    }

    res.json({ success: true, data: result });
  } catch (e) {
    log.error(`Negotiation respond error: ${e.message}`);
    res.status(500).json({ success: false, message: 'Failed to respond to negotiation' });
  }
}
};

module.exports = negotiation;
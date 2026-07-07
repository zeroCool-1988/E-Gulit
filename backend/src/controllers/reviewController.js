const Review = require('../models/ReviewModel');
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const log = require('../config/logger');
const pool = require('../config/database');

const review = {
  async create(req, res) {
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ success: false, message: 'Product ID and rating required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    try {
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const orders = await Order.getForUser(req.user.id);
      let purchased = false;
      for (const order of orders) {
        if (order.status === 'delivered') {
          const items = await Order.getItems(order.id);
          if (items.some(i => i.product_id === product_id)) {
            purchased = true;
            break;
          }
        }
      }

      if (!purchased) {
        return res.status(403).json({ success: false, message: 'You can only review products you have purchased' });
      }

      const review = await Review.create({
        product_id,
        user_id: req.user.id,
        rating,
        comment: comment || null
      });

      try {
        const avg = await Review.getAverageRating(product_id);
        await pool.query(
            'UPDATE products SET rating = $1 WHERE id = $2',
            [avg.avg, product_id]
        );
        } catch (ratingErr) {
        log.warn(`Rating update failed: ${ratingErr.message}`);
        // Don't fail the whole request
        }

      log.info(`Review created by ${req.user.username}`);
      res.status(201).json({ success: true, data: review });
    } catch (e) {
      log.error(`Review create error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to create review' });
    }
  },

  async getByProduct(req, res) {
    const { product_id } = req.params;

    try {
      const reviews = await Review.findByProduct(product_id);
      const avg = await Review.getAverageRating(product_id);
      res.json({
        success: true,
        data: {
          reviews,
          average: avg.avg,
          total: avg.count
        }
      });
    } catch (e) {
      log.error(`Review getByProduct error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get reviews' });
    }
  },

  async getByUser(req, res) {
    try {
      const reviews = await Review.findByUser(req.user.id);
      res.json({ success: true, data: reviews });
    } catch (e) {
      log.error(`Review getByUser error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get reviews' });
    }
  },

  async delete(req, res) {
    const { id } = req.params;

    try {
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      if (review.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      await Review.delete(id, req.user.id);
      res.json({ success: true, message: 'Review deleted' });
    } catch (e) {
      log.error(`Review delete error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
  }
};

module.exports = review;
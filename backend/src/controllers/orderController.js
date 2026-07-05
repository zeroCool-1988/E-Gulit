const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const Chapa = require('../services/chapaService');
const pool = require('../config/database');
const log = require('../config/logger');

const COMMISSION = 0.08;
const DELIVERY = 150;

const order = {
  async checkout(req, res) {
    try {
      const cart = await Cart.get(req.user.id);
      if (!cart || cart.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ success: false, message: 'Address required' });
      }

      let subtotal = 0;
      const items = [];
      const sellerPayouts = {};

      for (const item of cart) {
        const price = item.negotiated_price || item.price;
        const total = price * item.quantity;
        subtotal += total;
        items.push({
          product_id: item.product_id,
          seller_id: item.seller_id,
          qty: item.quantity,
          price: price
        });
        sellerPayouts[item.seller_id] = (sellerPayouts[item.seller_id] || 0) + (price * item.quantity * (1 - COMMISSION));
      }

      const commission = subtotal * COMMISSION;
      const delivery = DELIVERY;
      const total = subtotal + commission + delivery;
      const sellerPayout = Object.values(sellerPayouts).reduce((a, b) => a + b, 0);

      const ref = `EG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const orderData = {
        user_id: req.user.id,
        order_ref: ref,
        subtotal: subtotal,
        commission: commission,
        delivery: delivery,
        total: total,
        seller_payout: sellerPayout,
        address: address,
        items: items
      };

      const order = await Order.create(orderData);

      const chapa = await Chapa.initPayment({
        amount: total,
        email: req.user.email,
        tx_ref: ref,
        callback_url: `http://localhost:3000/api/payment/webhook`,
        return_url: `http://localhost:3000/payment/success`
      });

      if (!chapa || !chapa.data || !chapa.data.checkout_url) {
        return res.status(500).json({ success: false, message: 'Payment initiation failed' });
      }

      await Cart.clear(req.user.id);

      res.json({
        success: true,
        data: {
          order: order,
          payment_url: chapa.data.checkout_url,
          tx_ref: ref
        }
      });
    } catch (e) {
      log.error(`Checkout error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Checkout failed' });
    }
  },

  async getOrders(req, res) {
    try {
      let orders;
      if (req.user.role === 'admin') {
        orders = await Order.getAll();
      } else if (req.user.role === 'seller') {
        orders = await Order.getForSeller(req.user.id);
      } else {
        orders = await Order.getForUser(req.user.id);
      }

      for (const o of orders) {
        o.items = await Order.getItems(o.id);
      }

      res.json({ success: true, data: orders });
    } catch (e) {
      log.error(`Get orders error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get orders' });
    }
  },

  async getOrder(req, res) {
    const { id } = req.params;

    try {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
        const items = await Order.getItems(id);
        const hasItems = items.some(i => i.seller_id === req.user.id);
        if (!hasItems) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
        order.items = items;
      } else {
        order.items = await Order.getItems(id);
      }

      res.json({ success: true, data: order });
    } catch (e) {
      log.error(`Get order error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get order' });
    }
  },

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const items = await Order.getItems(id);
      const hasItems = items.some(i => i.seller_id === req.user.id);
      if (!hasItems && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const updated = await Order.updateStatus(id, status);
      res.json({ success: true, data: updated });
    } catch (e) {
      log.error(`Update status error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to update status' });
    }
  }
};

module.exports = order;
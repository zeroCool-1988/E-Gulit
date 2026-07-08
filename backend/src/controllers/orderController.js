const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const Chapa = require('../services/chapaService');
const User = require('../models/UserModel');
const { sendEmail } = require('../services/emailService');
const pool = require('../config/database');
const log = require('../config/logger');
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
const frontendUrl = process.env.APP_URL || 'http://localhost:5173';

const COMMISSION = 0.05;
const DELIVERY = 250;

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
        callback_url: `${backendUrl}/api/payment/webhook`,
        return_url: `${frontendUrl}/payment/success?ref=${ref}`,
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
      const { filter } = req.query;
      let orders;

      if (req.user.role === 'admin') {
        orders = await Order.getAll();
      } else if (req.user.role === 'seller') {
        if (filter === 'purchases') {
          orders = await Order.getForUser(req.user.id);
        } else {
          orders = await Order.getForSeller(req.user.id);
        }
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

      try {
        const buyer = await User.findById(order.user_id);
        const seller = await User.findById(req.user.id);

        const statusMap = {
          pending: 'Pending',
          paid: 'Paid',
          processing: 'Processing',
          shipped: 'Shipped',
          delivered: 'Delivered',
          cancelled: 'Cancelled'
        };

        const statusDisplay = statusMap[status] || status;

        if (buyer && buyer.email) {
          const itemList = items.map(i => 
            `<tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.qty}x ${i.product_name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${i.price} ETB</td>
            </tr>`
          ).join('');

          const buyerHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px;">
              <h2 style="color: #333; margin-top: 0;">Order Update</h2>
              <p>Hi ${buyer.username},</p>
              <p>Your order <strong>#${order.order_ref}</strong> has been updated to <strong style="color: #2e7d32;">${statusDisplay}</strong>.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
                      <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemList}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style="padding: 10px 8px; font-weight: bold; border-top: 2px solid #ddd;">Total</td>
                      <td style="padding: 10px 8px; font-weight: bold; text-align: right; border-top: 2px solid #ddd;">${order.total} ETB</td>
                    </tr>
                  </tfoot>
                </table>
                <p style="font-size: 14px; margin-top: 15px;"><strong>Delivery address:</strong> ${order.address}</p>
              </div>
              <p style="color: #666; font-size: 14px;">Thanks for shopping with us.</p>
              <p style="color: #999; font-size: 12px;">E-Gulit</p>
            </div>
          `;

          await sendEmail(
            buyer.email,
            `Order ${order.order_ref} status updated to ${statusDisplay}`,
            buyerHtml
          );
        }

        if (seller && seller.email) {
          const sellerHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px;">
              <h2 style="color: #333; margin-top: 0;">Order Status Update</h2>
              <p>Hi ${seller.username},</p>
              <p>Order <strong>#${order.order_ref}</strong> is now <strong style="color: #1565c0;">${statusDisplay}</strong>.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="font-size: 14px; margin: 5px 0;"><strong>Total:</strong> ${order.total} ETB</p>
                <p style="font-size: 14px; margin: 5px 0;"><strong>Delivery:</strong> ${order.address}</p>
                <p style="font-size: 14px; margin: 5px 0;"><strong>Status:</strong> ${statusDisplay}</p>
              </div>
              <p style="color: #666; font-size: 14px;">You can manage this order from your seller dashboard.</p>
              <p style="color: #999; font-size: 12px;">E-Gulit</p>
            </div>
          `;

          await sendEmail(
            seller.email,
            `Order ${order.order_ref} status updated to ${statusDisplay}`,
            sellerHtml
          );
        }
      } catch (emailErr) {
        log.warn(`Email notification failed: ${emailErr.message}`);
      }

      res.json({ success: true, data: updated });
    } catch (e) {
      log.error(`Update status error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to update status' });
    }
  },

  async confirmDelivery(req, res) {
    const { id } = req.params;

    try {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      if (order.status !== 'shipped') {
        return res.status(400).json({
          success: false,
          message: 'Order must be shipped before confirming delivery'
        });
      }

      const updated = await Order.updateStatus(order.id, 'delivered');

      try {
        const buyer = await User.findById(order.user_id);
        const items = await Order.getItems(order.id);
        const sellerIds = [...new Set(items.map(i => i.seller_id))];
        const sellers = await Promise.all(sellerIds.map(id => User.findById(id)));

        if (buyer && buyer.email) {
          await sendEmail(
            buyer.email,
            `Order ${order.order_ref} delivered`,
            `<p>You have confirmed delivery for order <strong>#${order.order_ref}</strong>. Thank you for shopping with E-Gulit!</p>`
          );
        }

        for (const seller of sellers) {
          if (seller && seller.email) {
            await sendEmail(
              seller.email,
              `Order ${order.order_ref} delivered`,
              `<p>Buyer has confirmed delivery for order <strong>#${order.order_ref}</strong>.</p>`
            );
          }
        }
      } catch (emailErr) {
        log.warn(`Delivery confirmation email failed: ${emailErr.message}`);
      }

      res.json({ success: true, data: updated });
    } catch (e) {
      log.error(`Confirm delivery error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to confirm delivery' });
    }
  },

  async getByRef(req, res) {
    const { tx_ref } = req.params;
    try {
      let order = await Order.findByChapaRef(tx_ref);
      if (!order) {
        order = await Order.findByRef(tx_ref);
      }
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      order.items = await Order.getItems(order.id);
      res.json({ success: true, data: order });
    } catch (e) {
      log.error(`Get order by ref error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to get order' });
    }
  },

  async payOrder(req, res) {
    const { id } = req.params;

    try {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Order is already paid or processed.' });
      }

      const user = await User.findById(order.user_id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const ref = `EG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await Order.updateChapaRef(order.id, ref);

      const chapa = await Chapa.initPayment({
        amount: order.total,
        email: user.email,
        tx_ref: ref,
        callback_url: `${backendUrl}/api/payment/webhook`,
        return_url: `${frontendUrl}/payment/success?ref=${ref}`,
      });

      if (!chapa || !chapa.data || !chapa.data.checkout_url) {
        return res.status(500).json({ success: false, message: 'Payment initiation failed' });
      }

      res.json({
        success: true,
        data: {
          payment_url: chapa.data.checkout_url,
          tx_ref: ref,
        },
      });
    } catch (e) {
      log.error(`Pay order error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to initiate payment' });
    }
  }
};

module.exports = order;
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const Chapa = require('../services/chapaService');
const pool = require('../config/database');
const log = require('../config/logger');

const payment = {
  async webhook(req, res) {
    const { tx_ref, status } = req.body;

    log.info(`Webhook received: ${tx_ref} - ${status}`);

    if (!tx_ref || !status) {
      return res.status(400).json({ success: false, message: 'Missing data' });
    }

    try {
      const order = await Order.findByRef(tx_ref);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (status === 'success') {
        if (process.env.NODE_ENV === 'production') { // success test with chapa's own verification in production ONLY
          try {
            const verify = await Chapa.verifyPayment(tx_ref);
            if (!verify || verify.status !== 'success') {
              log.warn(`Chapa verification failed for: ${tx_ref}`);
              return res.status(400).json({ success: false, message: 'Verification failed' });
            }
          } catch (verifyError) {
            log.error(`Chapa verification error: ${verifyError.message}`);
            return res.status(500).json({ success: false, message: 'Verification error' });
          }
        }

        await Order.updatePayment(order.id, 'paid', tx_ref);
        await Order.updateStatus(order.id, 'paid');

        const items = await Order.getItems(order.id);
        for (const item of items) {
          await pool.query(
            'UPDATE products SET quantity_in_stock = quantity_in_stock - $1 WHERE id = $2',
            [item.qty, item.product_id]
          );
        }
        for (const item of items) {
          const sellerPayout = item.price * item.qty * 0.92;
          log.info(`Updating seller ${item.seller_id} balance by +${sellerPayout}`);
          await pool.query(
            'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
            [sellerPayout, item.seller_id]
          );
        }

        log.info(`Payment success: ${tx_ref}`);
        res.json({ success: true, message: 'Payment confirmed' });
      } else {
        await Order.updatePayment(order.id, 'failed', tx_ref);
        log.warn(`Payment failed: ${tx_ref}`);
        res.json({ success: false, message: 'Payment failed' });
      }
    } catch (e) {
      log.error(`Webhook error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
  },

  async callback(req, res) {
    const { tx_ref, status } = req.query;
    log.info(`Callback: ${tx_ref} - ${status}`);
    res.redirect(`http://localhost:3000/payment/${status}?ref=${tx_ref}`);
  }
};

module.exports = payment;
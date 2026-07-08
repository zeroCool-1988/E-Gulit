const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const Chapa = require('../services/chapaService');
const { sendEmail } = require('../services/emailService');
const pool = require('../config/database');
const log = require('../config/logger');

const payment = {
  async webhook(req, res) {
    let tx_ref, status;

    if (req.method === 'GET') {
      tx_ref = req.query.trx_ref || req.query.tx_ref;
      status = req.query.status;
      log.warn('Webhook called with GET. This should be POST. Check your Chapa webhook URL.');
    } else if (req.body && req.body.tx_ref) {
      ({ tx_ref, status } = req.body);
    } else {
      return res.status(400).json({ success: false, message: 'No data received' });
    }

    if (!tx_ref || !status) {
      return res.status(400).json({ success: false, message: 'Missing tx_ref or status' });
    }

    log.info(`Webhook received: ${tx_ref} - ${status}`);

    try {
      const order = await Order.findByRef(tx_ref);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (status === 'success') {
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
          await pool.query(
            'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
            [sellerPayout, item.seller_id]
          );
        }

        try {
          const buyer = await User.findById(order.user_id);
          if (buyer && buyer.email) {
            const itemList = items.map(i => 
              `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.qty}x ${i.product_name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${i.price} ETB</td>
              </tr>`
            ).join('');

            await sendEmail(
              buyer.email,
              `Order Confirmed — ${order.order_ref}`,
              `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px;">
                  <h2 style="color: #2e7d32; margin-top: 0;">Payment Successful!</h2>
                  <p>Hi ${buyer.username},</p>
                  <p>Your order <strong>#${order.order_ref}</strong> has been confirmed.</p>
                  <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                      <thead>
                        <tr>
                          <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
                          <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
                        </tr>
                      </thead>
                      <tbody>${itemList}</tbody>
                      <tfoot>
                        <tr>
                          <td style="padding: 10px 8px; font-weight: bold; border-top: 2px solid #ddd;">Total Paid</td>
                          <td style="padding: 10px 8px; font-weight: bold; text-align: right; border-top: 2px solid #ddd;">${order.total} ETB</td>
                        </tr>
                      </tfoot>
                    </table>
                    <p style="font-size: 14px; margin-top: 15px;"><strong>Delivery address:</strong> ${order.address}</p>
                  </div>
                  <p style="color: #666; font-size: 14px;">Your order is now being processed.</p>
                  <p style="color: #999; font-size: 12px;">E-Gulit Bazaar</p>
                </div>
              `
            );
            log.info(`Payment confirmation email sent to: ${buyer.email}`);
          }
        } catch (emailErr) {
          log.warn(`Payment email failed: ${emailErr.message}`);
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
    const frontendUrl = process.env.APP_URL || 'http://localhost:5173';
    if (status === 'success') {
      res.redirect(`${frontendUrl}/payment/success`);
    } else {
      res.redirect(`${frontendUrl}/payment/cancel`);
    }
  }
};

module.exports = payment;
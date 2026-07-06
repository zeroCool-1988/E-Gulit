const axios = require('axios');
const log = require('../config/logger');

const CHAPA_KEY = process.env.CHAPA_API_KEY;
const CHAPA_URL = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';

const Chapa = {
  async initPayment(data) {
    try {
      if (!CHAPA_KEY) {
        throw new Error('CHAPA_API_KEY is not set in environment');
      }

      const payload = {
        amount: data.amount,
        currency: 'ETB',
        email: data.email,
        tx_ref: data.tx_ref,
        callback_url: data.callback_url || 'http://localhost:3000/api/payment/webhook',
        return_url: data.return_url || 'http://localhost:3000/payment/success',
        customization: {
          title: 'E-Gulit',
          description: 'Payment for order'
        }
      };

      log.info(`Chapa init payload: ${JSON.stringify(payload)}`);

      const r = await axios.post(`${CHAPA_URL}/transaction/initialize`, payload, {
        headers: {
          Authorization: `Bearer ${CHAPA_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      log.info(`Chapa init success: ${data.tx_ref}`);
      return r.data;
    } catch (e) {
      log.error(`Chapa init error: ${e.message}`);
      if (e.response) {
        log.error(`Chapa response status: ${e.response.status}`);
        log.error(`Chapa response data: ${JSON.stringify(e.response.data)}`);
      }
      throw e;
    }
  },

  async verifyPayment(tx_ref) {
    try {
      const r = await axios.get(`${CHAPA_URL}/transaction/verify/${tx_ref}`, {
        headers: {
          Authorization: `Bearer ${CHAPA_KEY}`
        }
      });
      return r.data;
    } catch (e) {
      log.error(`Chapa verify error: ${e.message}`);
      throw e;
    }
  }
};

module.exports = Chapa;
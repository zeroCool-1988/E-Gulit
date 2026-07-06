const nodemailer = require('nodemailer');
const log = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'E-Gulit <noreply@egulit.com>',
      to,
      subject,
      html,
    });
    log.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (e) {
    log.error(`Email send error: ${e.message}`);
    return false;
  }
};

module.exports = { sendEmail };
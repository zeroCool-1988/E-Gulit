require('dotenv').config();
const express = require('express');
const log = require('./config/logger');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.get('/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (_, res) => {
  res.send('E-Gulit API is live');
});

app.use((req, res) => {
  log.warn(`404: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  log.error(err.message);
  const response = { success: false, message: 'Something broke' };
  if (process.env.NODE_ENV === 'development') response.stack = err.stack;
  res.status(500).json(response);
});

app.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
  console.log(`Health: http://localhost:${port}/health`);
});
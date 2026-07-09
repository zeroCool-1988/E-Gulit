const { exec } = require('child_process');
const { Pool } = require('pg');
require('dotenv').config();

async function autoSetupDB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 100000,
  });

  try {
    await pool.query("SELECT 1 FROM users LIMIT 1");
    console.log('[+] Database already set up.');
    await pool.end();
    return;
  } catch {
    console.log('[+] Setting up database...');
    await pool.end();

    exec('npm run db:setup', { cwd: __dirname, shell: true }, (err, stdout, stderr) => {
      if (err) { console.error('[-] Setup failed:', err); return; }
      console.log(stdout);

      // Populate the db
      exec('npm run db:seed', { cwd: __dirname, shell: true }, (err2, stdout2, stderr2) => {
        if (err2) { console.error('[-] Seed failed:', err2); return; }
        console.log(stdout2);
        console.log('[+] Database setup complete!');
      });
    });
  }
}

autoSetupDB();

const path = require('path');
const express = require('express');
const log = require('./config/logger');
const cors = require('cors');
const { limiter, authLimiter, refreshLimiter } = require('./config/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const authController = require('./controllers/authController');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const negotiationRoutes = require('./routes/negotiationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const { adminLimiter } = require('./config/rateLimiter');
const adminRoutes = require('./routes/adminRoutes');


const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));

app.use('/api/admin', adminLimiter, adminRoutes);
app.get('/api/auth/check-username', authController.checkUsername);
app.post('/api/auth/refresh', refreshLimiter, authController.refresh);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

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

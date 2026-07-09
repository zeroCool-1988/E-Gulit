const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const PASSWORD = 'password123';
const HASHED_PASSWORD = bcrypt.hashSync(PASSWORD, 12);

const isReset = process.argv.includes('--reset');

const seed = async () => {
  try {
    if (isReset) {
      console.log('Clearing existing data...');
      await pool.query('TRUNCATE TABLE reviews, order_items, orders, negotiations, cart, products, categories, addresses, seller_profiles, users CASCADE;');
    }

    console.log('Inserting seed data...');

    // Users
    const users = [
      { id: '11111111-1111-1111-1111-111111111111', username: 'admin', email: 'admin@egulit.com', full_name: 'Admin', role: 'admin', phone: '0911000000' },
      { id: '22222222-2222-2222-2222-222222222222', username: 'abebe_seller', email: 'abebe@egulit.com', full_name: 'Abebe Kebede', role: 'seller', phone: '0912000001', store_name: 'Abebe Electronics', location: 'Bole, Addis Ababa', bio: 'Quality electronics since 2010.' },
      { id: '33333333-3333-3333-3333-333333333333', username: 'hanna_seller', email: 'hanna@egulit.com', full_name: 'Hanna Tadesse', role: 'seller', phone: '0912000002', store_name: 'Hanna Tech Hub', location: 'Megenagna, Addis Ababa', bio: 'Gadgets and accessories.' },
      { id: '44444444-4444-4444-4444-444444444444', username: 'samuel_seller', email: 'samuel@egulit.com', full_name: 'Samuel Yohannes', role: 'seller', phone: '0912000003', store_name: 'Samuel Home Appliances', location: 'Piazza, Addis Ababa', bio: 'Best home appliances.' },
      { id: '55555555-5555-5555-5555-555555555555', username: 'tigist_seller', email: 'tigist@egulit.com', full_name: 'Tigist Worku', role: 'seller', phone: '0912000004', store_name: 'Tigist Gadget World', location: 'CMC, Addis Ababa', bio: 'Latest tech gadgets.' },
      { id: '66666666-6666-6666-6666-666666666666', username: 'ermias_buyer', email: 'ermias@egulit.com', full_name: 'Ermias Lemma', role: 'buyer', phone: '0913000001' },
      { id: '77777777-7777-7777-7777-777777777777', username: 'sara_buyer', email: 'sara@egulit.com', full_name: 'Sara Mohammed', role: 'buyer', phone: '0913000002' },
      { id: '88888888-8888-8888-8888-888888888888', username: 'dawit_buyer', email: 'dawit@egulit.com', full_name: 'Dawit Haile', role: 'buyer', phone: '0913000003' },
      { id: '99999999-9999-9999-9999-999999999999', username: 'meron_buyer', email: 'meron@egulit.com', full_name: 'Meron Tesfaye', role: 'buyer', phone: '0913000004' },
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, full_name, account_role, phone_number, is_email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
         ON CONFLICT (email) DO NOTHING`,
        [u.id, u.username, u.email, HASHED_PASSWORD, u.full_name, u.role, u.phone]
      );
      if (u.role === 'seller') {
        await pool.query(
          `INSERT INTO seller_profiles (user_id, store_name, stall_location, bio)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id) DO NOTHING`,
          [u.id, u.store_name, u.location, u.bio]
        );
      }
    }

    // Categories
    const categories = [
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Televisions', desc: 'Smart TVs, LED, OLED' },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Laptops', desc: 'Notebooks, Ultrabooks, Gaming' },
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Mobile Phones', desc: 'Smartphones and accessories' },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'Audio', desc: 'Speakers, Headphones' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', name: 'Home Appliances', desc: 'Refrigerators, Washing Machines' },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', name: 'Accessories', desc: 'Chargers, Cables, Cases' },
    ];

    for (const c of categories) {
      await pool.query(
        `INSERT INTO categories (id, category_name, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (category_name) DO NOTHING`,
        [c.id, c.name, c.desc]
      );
    }

    // Products
    const products = [
      { id: '66666666-6666-6666-6666-666666666667', name: 'Samsung 55" QLED Smart TV', price: 55000, stock: 10, condition: 'new', negotiable: true, seller: '22222222-2222-2222-2222-222222222222', cat: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', desc: '4K QLED Smart TV with HDR.', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop'] },
      { id: '77777777-7777-7777-7777-777777777778', name: 'LG OLED 65" TV', price: 85000, stock: 5, condition: 'new', negotiable: true, seller: '22222222-2222-2222-2222-222222222222', cat: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', desc: 'OLED with Dolby Vision.', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop'] },
      { id: '88888888-8888-8888-8888-888888888889', name: 'Dell XPS 13 Laptop', price: 85000, stock: 8, condition: 'new', negotiable: false, seller: '33333333-3333-3333-3333-333333333333', cat: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', desc: 'Ultrabook, i7, 16GB RAM.', images: ['https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop'] },
      { id: '99999999-9999-9999-9999-999999999990', name: 'MacBook Pro 14"', price: 120000, stock: 4, condition: 'new', negotiable: true, seller: '33333333-3333-3333-3333-333333333333', cat: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', desc: 'M2 Pro, 16GB RAM.', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'] },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', name: 'iPhone 15 Pro', price: 95000, stock: 10, condition: 'new', negotiable: true, seller: '33333333-3333-3333-3333-333333333333', cat: 'cccccccc-cccc-cccc-cccc-cccccccccccc', desc: 'A17 Pro, 256GB.', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop'] },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', name: 'Samsung Galaxy S24', price: 80000, stock: 12, condition: 'new', negotiable: true, seller: '22222222-2222-2222-2222-222222222222', cat: 'cccccccc-cccc-cccc-cccc-cccccccccccc', desc: 'AI features, 256GB.', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop'] },
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccccd', name: 'Sony WH-1000XM5', price: 12000, stock: 15, condition: 'new', negotiable: true, seller: '33333333-3333-3333-3333-333333333333', cat: 'dddddddd-dddd-dddd-dddd-dddddddddddd', desc: 'Noise cancelling headphones.', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=300&fit=crop'] },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'JBL Flip 6 Speaker', price: 6400, stock: 20, condition: 'new', negotiable: false, seller: '33333333-3333-3333-3333-333333333333', cat: 'dddddddd-dddd-dddd-dddd-dddddddddddd', desc: 'Portable waterproof speaker.', images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop'] },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', name: 'LG Refrigerator 500L', price: 45000, stock: 6, condition: 'new', negotiable: true, seller: '44444444-4444-4444-4444-444444444444', cat: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', desc: 'French door, water dispenser.', images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop'] },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', name: 'Samsung Washing Machine', price: 38000, stock: 8, condition: 'new', negotiable: true, seller: '44444444-4444-4444-4444-444444444444', cat: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', desc: 'Front load, 10kg.', images: ['https://images.unsplash.com/photo-1626806787461-102c1a3f2d9a?w=400&h=300&fit=crop'] },
      { id: '11111111-1111-1111-1111-111111111112', name: 'Used iPhone 12', price: 25000, stock: 3, condition: 'used', negotiable: true, seller: '33333333-3333-3333-3333-333333333333', cat: 'cccccccc-cccc-cccc-cccc-cccccccccccc', desc: '64GB, good condition.', images: ['https://images.unsplash.com/photo-1603928726698-a0a7f4986e1a?w=400&h=300&fit=crop'] },
      { id: '22222222-2222-2222-2222-222222222223', name: 'Used Dell Inspiron', price: 15000, stock: 2, condition: 'used', negotiable: true, seller: '22222222-2222-2222-2222-222222222222', cat: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', desc: 'i5, 8GB RAM.', images: ['https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop'] },
      { id: '33333333-3333-3333-3333-333333333334', name: 'Samsung Galaxy Watch 6', price: 12000, stock: 10, condition: 'new', negotiable: false, seller: '55555555-5555-5555-5555-555555555555', cat: 'ffffffff-ffff-ffff-ffff-ffffffffffff', desc: 'Smartwatch with health tracking.', images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=300&fit=crop'] },
    ];

    for (const p of products) {
      await pool.query(
        `INSERT INTO products (id, product_name, price, quantity_in_stock, product_condition, is_negotiable, seller_id, category_id, description, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.price, p.stock, p.condition, p.negotiable, p.seller, p.cat, p.desc, p.images]
      );
    }

    // Reviews
    const reviews = [
      { product: '66666666-6666-6666-6666-666666666667', user: '66666666-6666-6666-6666-666666666666', rating: 5, comment: 'Amazing TV! Picture quality is incredible.' },
      { product: '66666666-6666-6666-6666-666666666667', user: '77777777-7777-7777-7777-777777777777', rating: 4, comment: 'Good value for money.' },
      { product: '88888888-8888-8888-8888-888888888889', user: '88888888-8888-8888-8888-888888888888', rating: 5, comment: 'Perfect laptop for work.' },
      { product: '99999999-9999-9999-9999-999999999990', user: '99999999-9999-9999-9999-999999999999', rating: 5, comment: 'Expensive but worth every birr.' },
      { product: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', user: '66666666-6666-6666-6666-666666666666', rating: 4, comment: 'Fast and smooth. Best iPhone yet.' },
      { product: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', user: '77777777-7777-7777-7777-777777777777', rating: 5, comment: 'Best Android phone on the market.' },
      { product: 'cccccccc-cccc-cccc-cccc-cccccccccccd', user: '88888888-8888-8888-8888-888888888888', rating: 5, comment: 'Noise cancellation is insane!' },
      { product: 'dddddddd-dddd-dddd-dddd-dddddddddddd', user: '99999999-9999-9999-9999-999999999999', rating: 4, comment: 'Good sound for the price.' },
      { product: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', user: '66666666-6666-6666-6666-666666666666', rating: 5, comment: 'Spacious and quiet fridge.' },
      { product: 'ffffffff-ffff-ffff-ffff-ffffffffffff', user: '77777777-7777-7777-7777-777777777777', rating: 4, comment: 'Cleans clothes well.' },
      { product: '11111111-1111-1111-1111-111111111112', user: '88888888-8888-8888-8888-888888888888', rating: 3, comment: 'Good phone but battery drains fast.' },
      { product: '22222222-2222-2222-2222-222222222223', user: '99999999-9999-9999-9999-999999999999', rating: 4, comment: 'Works fine for daily use.' },
      { product: '33333333-3333-3333-3333-333333333334', user: '66666666-6666-6666-6666-666666666666', rating: 5, comment: 'Great smartwatch!' },
      { product: '66666666-6666-6666-6666-666666666667', user: '88888888-8888-8888-8888-888888888888', rating: 4, comment: 'Love the smart features.' },
      { product: '99999999-9999-9999-9999-999999999990', user: '77777777-7777-7777-7777-777777777777', rating: 5, comment: 'Best laptop I ever owned.' },
    ];

    for (const r of reviews) {
      await pool.query(
        `INSERT INTO reviews (product_id, user_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (product_id, user_id) DO NOTHING`,
        [r.product, r.user, r.rating, r.comment]
      );
    }

    console.log('Seed complete.');
    console.log('Users: 9 (1 admin, 4 sellers, 4 buyers)');
    console.log('Categories: 6');
    console.log('Products: 13');
    console.log('Reviews: 15');
    console.log('All passwords: password123');
    await pool.end();
  } catch (err) {
    console.error('Seed failed:', err.message);
    await pool.end();
    process.exit(1);
  }
};

seed();

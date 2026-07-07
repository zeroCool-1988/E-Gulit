TRUNCATE TABLE cart CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE addresses CASCADE;
TRUNCATE TABLE seller_profiles CASCADE;
TRUNCATE TABLE users CASCADE;

INSERT INTO users (id, username, email, password_hash, full_name, account_role, phone_number, is_verified_seller, wallet_balance)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'admin',
    'admin@example.com',
    '$2b$12$b.Kbjbo.vwF1gdXpeJcaEObe2QpfVazyZ1NHhYqWPF.R.EgKb9qmG',
    'Admin User',
    'admin',
    '0911000000',
    TRUE,
    0
),
(
    '22222222-2222-2222-2222-222222222222',
    'abebe_seller',
    'abebe@example.com',
    '$2b$12$b.Kbjbo.vwF1gdXpeJcaEObe2QpfVazyZ1NHhYqWPF.R.EgKb9qmG',
    'Abebe Bekele',
    'seller',
    '0912000001',
    TRUE,
    0
),
(
    '33333333-3333-3333-3333-333333333333',
    'hanna_seller',
    'hanna@example.com',
    '$2b$12$b.Kbjbo.vwF1gdXpeJcaEObe2QpfVazyZ1NHhYqWPF.R.EgKb9qmG',
    'Hanna Mulugeta',
    'seller',
    '0912000002',
    FALSE,
    0
),
(
    '44444444-4444-4444-4444-444444444444',
    'dawit_seller',
    'dawit@example.com',
    '$2b$12$b.Kbjbo.vwF1gdXpeJcaEObe2QpfVazyZ1NHhYqWPF.R.EgKb9qmG',
    'Dawit Alemu',
    'seller',
    '0912000003',
    TRUE,
    0
),
(
    '55555555-5555-5555-5555-555555555555',
    'samuel_buyer',
    'samuel@example.com',
    '$2b$12$b.Kbjbo.vwF1gdXpeJcaEObe2QpfVazyZ1NHhYqWPF.R.EgKb9qmG',
    'Samuel Bekele',
    'buyer',
    '0913000001',
    FALSE,
    0
),
(
    '66666666-6666-6666-6666-666666666666',
    'sara_buyer',
    'sara@example.com',
    '$2b$12$b.Kbjbo.vwF1gdXpeJcaEObe2QpfVazyZ1NHhYqWPF.R.EgKb9qmG',
    'Sara Tadesse',
    'buyer',
    '0913000002',
    FALSE,
    0
);

INSERT INTO seller_profiles (id, user_id, store_name, stall_location, bio, rating, review_count)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Abebe Electronics',
    'Bole, Addis Ababa',
    'Authorized dealer for Samsung, LG, Sony. 10+ years in business.',
    4.5,
    120
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'Hanna Tech Hub',
    'Megenagna, Addis Ababa',
    'Quality electronics at affordable prices. Specializing in computers.',
    3.8,
    45
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '44444444-4444-4444-4444-444444444444',
    'Dawit Home Appliances',
    'Piazza, Addis Ababa',
    'Home appliances and electronics. Genuine parts and warranty.',
    4.2,
    78
);

INSERT INTO addresses (id, user_id, label, street, city, region, is_default)
VALUES
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '55555555-5555-5555-5555-555555555555',
    'Home',
    'Piazza, near the church',
    'Addis Ababa',
    'Addis Ababa',
    TRUE
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '66666666-6666-6666-6666-666666666666',
    'Home',
    'CMC, behind the mall',
    'Addis Ababa',
    'Addis Ababa',
    TRUE
);

INSERT INTO categories (id, category_name, description, parent_category_id)
VALUES
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'TVs & Audio',
    'Televisions, sound systems, and accessories',
    NULL
),
(
    '11111111-1111-1111-1111-111111111112',
    'Computers',
    'Laptops, desktops, and peripherals',
    NULL
),
(
    '22222222-2222-2222-2222-222222222223',
    'Home Appliances',
    'Refrigerators, washing machines, etc.',
    NULL
),
(
    '33333333-3333-3333-3333-333333333334',
    'Smart TVs',
    'Internet-enabled televisions',
    'ffffffff-ffff-ffff-ffff-ffffffffffff'
),
(
    '44444444-4444-4444-4444-444444444445',
    'Laptops',
    'Portable computers',
    '11111111-1111-1111-1111-111111111112'
);

INSERT INTO products
(id, seller_id, category_id, product_name, description, price, quantity_in_stock, product_condition, is_negotiable, is_featured, images, view_count)
VALUES
(
    '55555555-5555-5555-5555-555555555556',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333334',
    'Samsung 55" QLED Smart TV',
    'Brand new 55-inch QLED 4K Smart TV with Netflix and YouTube built-in.',
    55000.00,
    10,
    'new',
    TRUE,
    TRUE,
    ARRAY['https://via.placeholder.com/300x300?text=SamsungTV'],
    12
),
(
    '66666666-6666-6666-6666-666666666667',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444445',
    'Dell XPS 13 Laptop',
    'Intel i7, 16GB RAM, 512GB SSD. Ultrabook with 13-inch display.',
    85000.00,
    5,
    'new',
    FALSE,
    TRUE,
    ARRAY['https://via.placeholder.com/300x300?text=DellXPS'],
    8
),
(
    '77777777-7777-7777-7777-777777777778',
    '33333333-3333-3333-3333-333333333333',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Sony WH-1000XM5 Headphones',
    'Wireless noise-cancelling headphones with 30-hour battery life.',
    12000.00,
    15,
    'new',
    TRUE,
    FALSE,
    ARRAY['https://via.placeholder.com/300x300?text=SonyHeadphones'],
    5
),
(
    '88888888-8888-8888-8888-888888888889',
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222223',
    'LG Refrigerator 500L',
    'French door refrigerator with water dispenser. Energy efficient.',
    45000.00,
    3,
    'new',
    TRUE,
    FALSE,
    ARRAY['https://via.placeholder.com/300x300?text=LGFridge'],
    3
);
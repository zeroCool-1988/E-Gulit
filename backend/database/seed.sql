-- temp data for test

-- Admin
INSERT INTO users (id, username, email, password_hash, account_role, phone_number)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin',
    'admin@egulit.com',
    'temp_hash_placeholder',
    'admin',
    '0911000000'
) ON CONFLICT (email) DO NOTHING;

-- Sellers (user)
INSERT INTO users (id, username, email, password_hash, account_role, phone_number, is_verified_seller)
VALUES 
(
    '22222222-2222-2222-2222-222222222222',
    'alem_seller',
    'alem@test.com',
    'temp_hash_placeholder',
    'seller',
    '0912000001',
    TRUE
),
(
    '33333333-3333-3333-3333-333333333333',
    'hanna_seller',
    'hanna@test.com',
    'temp_hash_placeholder',
    'seller',
    '0912000002',
    FALSE
) ON CONFLICT (email) DO NOTHING;

-- Seller (profile)
INSERT INTO seller_profiles (id, user_id, store_name, stall_location, bio, rating, review_count)
VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Alem Electronics',
    'Bole, Addis Ababa',
    'Authorized dealer for Samsung, LG, and Sony. 10+ years in business.',
    4.5,
    120
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'Hanna Tech Store',
    'Megenagna, Addis Ababa',
    'Quality electronics at affordable prices.',
    3.8,
    45
) ON CONFLICT (user_id) DO NOTHING;

-- Buyers (the normal customers)
INSERT INTO users (id, username, email, password_hash, account_role, phone_number)
VALUES 
(
    '44444444-4444-4444-4444-444444444444',
    'samuel_buyer',
    'samuel@test.com',
    'temp_hash_placeholder',
    'buyer',
    '0913000001'
),
(
    '55555555-5555-5555-5555-555555555555',
    'sara_buyer',
    'sara@test.com',
    'temp_hash_placeholder',
    'buyer',
    '0913000002'
) ON CONFLICT (email) DO NOTHING;

-- Addresses for buyers
INSERT INTO addresses (id, user_id, label, street, city, region, is_default)
VALUES 
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '44444444-4444-4444-4444-444444444444',
    'Home',
    'Piazza, near the church',
    'Addis Ababa',
    'Addis Ababa',
    TRUE
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '55555555-5555-5555-5555-555555555555',
    'Home',
    'CMC, behind the mall',
    'Addis Ababa',
    'Addis Ababa',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, category_name, description, parent_category_id)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TVs & Audio', 'Televisions and sound systems', NULL),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Computers', 'Laptops, desktops, and accessories', NULL),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Home Appliances', 'Refrigerators, washing machines, etc.', NULL),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Smart TVs', 'Internet-enabled televisions', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (category_name) DO NOTHING;

-- Products
INSERT INTO products (id, seller_id, category_id, product_name, description, price, quantity_in_stock, product_condition, is_negotiable, is_featured, images)
VALUES 
(
    '66666666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222222',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Samsung 55" Smart TV',
    'Brand new 55-inch QLED 4K Smart TV. Netflix and YouTube built-in.',
    55000.00,
    10,
    'new',
    TRUE,
    TRUE,
    ARRAY['https://via.placeholder.com/300x300?text=TV']
),
(
    '77777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Dell XPS 13 Laptop',
    'Intel i7, 16GB RAM, 512GB SSD. Ultrabook.',
    85000.00,
    5,
    'new',
    FALSE,
    TRUE,
    ARRAY['https://via.placeholder.com/300x300?text=Laptop']
),
(
    '88888888-8888-8888-8888-888888888888',
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'LG Refrigerator 500L',
    'French door with water dispenser. Energy efficient.',
    45000.00,
    3,
    'new',
    TRUE,
    FALSE,
    ARRAY['https://via.placeholder.com/300x300?text=Fridge']
)
ON CONFLICT (id) DO NOTHING;
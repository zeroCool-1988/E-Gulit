-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    account_role VARCHAR(15) DEFAULT 'buyer' CHECK (account_role IN ('buyer', 'seller', 'admin')),
    phone_number VARCHAR(20),
    is_verified_seller BOOLEAN DEFAULT FALSE,
    wallet_balance NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SELLER PROFILES TABLE

DROP TABLE IF EXISTS seller_profiles CASCADE;
CREATE TABLE seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(200) NOT NULL,
    stall_location VARCHAR(200),
    bio TEXT,
    rating NUMERIC(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADDRESSES TABLE

DROP TABLE IF EXISTS addresses CASCADE;
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'Home',
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'Addis Ababa',
    region VARCHAR(100),
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES TABLE

DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(60) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS TABLE

DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price > 0),
    quantity_in_stock INTEGER NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    product_condition VARCHAR(20) DEFAULT 'new' CHECK (product_condition IN ('new', 'used', 'refurbished')),
    is_negotiable BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    images TEXT[],
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CART TABLE
DROP TABLE IF EXISTS cart CASCADE;
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    negotiated_price NUMERIC(12,2),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

--NEGOTIATIONS TABLE
DROP TABLE IF EXISTS negotiations CASCADE;
CREATE TABLE negotiations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offered_price NUMERIC(12,2) NOT NULL CHECK (offered_price > 0), 
    counter_price NUMERIC(12,2) CHECK (counter_price > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'countered', 'accepted', 'rejected', 'expired')),
    buyer_message TEXT,
    seller_message TEXT,
    counter_round INTEGER DEFAULT 1 CHECK (counter_round <= 3),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_ref VARCHAR(50) UNIQUE NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    commission NUMERIC(12,2) NOT NULL,
    delivery NUMERIC(12,2) NOT NULL DEFAULT 150,
    total NUMERIC(12,2) NOT NULL,
    seller_payout NUMERIC(12,2) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
    chapa_ref VARCHAR(100),
    settlement VARCHAR(20) DEFAULT 'pending' CHECK (settlement IN ('pending','processing','completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES just for performance optimization

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_seller_profiles_user ON seller_profiles(user_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_cart_product ON cart(product_id);

CREATE INDEX idx_negotiations_buyer ON negotiations(buyer_id);
CREATE INDEX idx_negotiations_seller ON negotiations(seller_id);
CREATE INDEX idx_negotiations_product ON negotiations(product_id);
CREATE INDEX idx_negotiations_status ON negotiations(status);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_ref ON orders(order_ref);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);

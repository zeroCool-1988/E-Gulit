erDiagram
    USERS {
        UUID id PK
        VARCHAR username
        VARCHAR email
        TEXT password_hash
        VARCHAR full_name
        VARCHAR account_role
        VARCHAR phone_number
        BOOLEAN is_verified_seller
        BOOLEAN is_email_verified
        DECIMAL wallet_balance
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    SELLER_PROFILES {
        UUID id PK
        UUID user_id FK
        VARCHAR store_name
        VARCHAR stall_location
        TEXT bio
        DECIMAL rating
        INTEGER review_count
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ADDRESSES {
        UUID id PK
        UUID user_id FK
        VARCHAR label
        VARCHAR street
        VARCHAR city
        VARCHAR region
        VARCHAR postal_code
        BOOLEAN is_default
        TIMESTAMP created_at
    }

    CATEGORIES {
        UUID id PK
        VARCHAR category_name
        TEXT description
        UUID parent_category_id FK
        TIMESTAMP created_at
    }

    PRODUCTS {
        UUID id PK
        UUID seller_id FK
        UUID category_id FK
        VARCHAR product_name
        TEXT description
        DECIMAL price
        INTEGER quantity_in_stock
        VARCHAR product_condition
        BOOLEAN is_negotiable
        BOOLEAN is_featured
        TEXT[] images
        INTEGER view_count
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    CART {
        UUID id PK
        UUID user_id FK
        UUID product_id FK
        INTEGER quantity
        DECIMAL negotiated_price
        TIMESTAMP added_at
    }

    NEGOTIATIONS {
        UUID id PK
        UUID product_id FK
        UUID buyer_id FK
        UUID seller_id FK
        DECIMAL offered_price
        DECIMAL counter_price
        VARCHAR status
        TEXT buyer_message
        TEXT seller_message
        INTEGER counter_round
        TIMESTAMP expires_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ORDERS {
        UUID id PK
        UUID user_id FK
        VARCHAR order_ref
        DECIMAL subtotal
        DECIMAL commission
        DECIMAL delivery
        DECIMAL total
        DECIMAL seller_payout
        TEXT address
        VARCHAR status
        VARCHAR payment_status
        VARCHAR chapa_ref
        VARCHAR settlement
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ORDER_ITEMS {
        UUID id PK
        UUID order_id FK
        UUID product_id FK
        UUID seller_id FK
        INTEGER quantity
        DECIMAL price_at_purchase
        TIMESTAMP created_at
    }

    REVIEWS {
        UUID id PK
        UUID product_id FK
        UUID user_id FK
        INTEGER rating
        TEXT comment
        TIMESTAMP created_at
    }

    USERS ||--|| SELLER_PROFILES : has
    USERS ||--o{ ADDRESSES : has
    USERS ||--o{ PRODUCTS : sells
    USERS ||--o{ ORDERS : places
    USERS ||--o{ CART : has
    USERS ||--o{ NEGOTIATIONS : "as buyer"
    USERS ||--o{ NEGOTIATIONS : "as seller"
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ ORDER_ITEMS : sells

    CATEGORIES ||--o{ PRODUCTS : contains
    CATEGORIES ||--o{ CATEGORIES : "has subcategory"

    PRODUCTS ||--o{ CART : "in cart"
    PRODUCTS ||--o{ NEGOTIATIONS : has
    PRODUCTS ||--o{ ORDER_ITEMS : "in order"
    PRODUCTS ||--o{ REVIEWS : receives

    ORDERS ||--o{ ORDER_ITEMS : contains
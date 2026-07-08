import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/apiClient';
import '../styles/Cart.css';

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 5.5h12l-1.1 11a2 2 0 01-2 1.8H7.1a2 2 0 01-2-1.8L4 5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.5 5.5V4a1.5 1.5 0 013 0v1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 9v5.5M11.5 9v5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconDevice() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect x="8" y="6" width="24" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 32h8M20 28v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconTicketSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v2l-1.4 1.4L17 10.3v2A1.5 1.5 0 0115.5 14h-11A1.5 1.5 0 013 12.5v-2l1.4-1.4L3 7.5v-2z" fill="currentColor" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 4.5L6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 4.5L14 10l-6.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatBirr(amount) {
  return `${Number(amount).toLocaleString('en-US')} birr`;
}

const COMMISSION_RATE = 0.08;
const DELIVERY_FEE = 250;

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  function fetchCart() {
    setLoading(true);
    api.get('/cart')
      .then((data) => {
        setItems(data.data?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load cart.');
        setLoading(false);
      });
  }

  async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 0) return;
    setUpdating(true);
    try {
      if (newQuantity === 0) {
        await api.delete(`/cart/${itemId}`);
      } else {
        await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      }
      await fetchCart();
    } catch (err) {
      alert(err.message || 'Could not update cart.');
    } finally {
      setUpdating(false);
    }
  }

  async function removeItem(itemId) {
    if (!confirm('Remove this item from your cart?')) return;
    setUpdating(true);
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch (err) {
      alert(err.message || 'Could not remove item.');
    } finally {
      setUpdating(false);
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.negotiated_price || item.price;
    return sum + (price * item.quantity);
  }, 0);

  const commission = subtotal * COMMISSION_RATE;
  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + commission + delivery;

  if (loading) {
    return (
      <div className="container cart-page">
        <div className="cart-heading">
          <div className="eyebrow">Order basket</div>
          <h1>Your Cart</h1>
        </div>
        <div className="cart-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-line" style={{ height: 80, marginBottom: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container cart-page">
        <div className="cart-heading">
          <div className="eyebrow">Order basket</div>
          <h1>Your Cart</h1>
        </div>
        <div className="form-error-banner">{error}</div>
        <Link to="/shop" className="btn btn-outline">Continue shopping</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container cart-page">
        <div className="cart-heading">
          <div className="eyebrow">Order basket</div>
          <h1>Your Cart</h1>
        </div>
        <div className="empty-cart">
          <IconDevice />
          <h2>Your cart is empty</h2>
          <p>Browse the shop and add some items.</p>
          <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div className="cart-heading">
        <div className="eyebrow">Order basket</div>
        <h1>Your Cart</h1>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const price = item.negotiated_price || item.price;
            const itemTotal = price * item.quantity;
            const isNegotiated = !!item.negotiated_price;

            return (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <IconDevice />
                </div>
                <div className="cart-item-info">
                  <h3>{item.product_name || 'Product'}</h3>
                  <p className="cart-item-seller">
                    {item.seller_name || 'Unknown seller'}
                    {isNegotiated && (
                      <span className="negotiated-badge">
                        <IconTicketSmall /> Negotiated
                      </span>
                    )}
                  </p>
                  <div className="cart-item-price">
                    {isNegotiated ? (
                      <>
                        <span className="price">{formatBirr(price)}</span>
                        <span className="original-price">{formatBirr(item.price)}</span>
                      </>
                    ) : (
                      <span className="price">{formatBirr(price)}</span>
                    )}
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updating}
                      aria-label="Decrease quantity"
                    >
                      <IconMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updating}
                      aria-label="Increase quantity"
                    >
                      <IconPlus />
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                    disabled={updating}
                    aria-label="Remove item"
                  >
                    <IconTrash />
                  </button>
                </div>
                <div className="cart-item-total price">
                  {formatBirr(itemTotal)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-punch cart-summary-punch-left" />
          <div className="cart-summary-punch cart-summary-punch-right" />
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span className="price">{formatBirr(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Commission (8%)</span>
            <span className="price">{formatBirr(commission)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span className="price">{formatBirr(delivery)}</span>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span className="price">{formatBirr(total)}</span>
          </div>
          <button
            className="btn btn-primary checkout-btn"
            onClick={() => navigate('/checkout')}
            disabled={items.length === 0}
          >
            Proceed to Checkout <IconArrowRight />
          </button>
          <Link to="/shop" className="continue-shopping">
            <IconArrowLeft /> Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

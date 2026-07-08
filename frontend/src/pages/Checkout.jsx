import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import '../styles/Checkout.css';

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 4.5L6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatBirr(amount) {
  return `${Number(amount).toLocaleString('en-US')} birr`;
}

const COMMISSION_RATE = 0.08;
const DELIVERY_FEE = 250;

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cart')
      .then((data) => {
        const cartItems = data.data?.items || [];
        if (cartItems.length === 0) {
          navigate('/cart');
          return;
        }
        setItems(cartItems);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load your cart.');
        setLoading(false);
      });
  }, [navigate]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.negotiated_price || item.price;
    return sum + (price * item.quantity);
  }, 0);

  const commission = subtotal * COMMISSION_RATE;
  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + commission + delivery;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter your delivery address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await api.post('/orders/checkout', { address: address.trim() });
      const paymentUrl = result.data?.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setError('Could not initiate payment. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container checkout-page">
        <h1>Checkout</h1>
        <div className="checkout-skeleton">
          <div className="skeleton-line" style={{ height: 200 }} />
          <div className="skeleton-line" style={{ height: 300, marginTop: 20 }} />
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="container checkout-page">
        <h1>Checkout</h1>
        <div className="form-error-banner">{error}</div>
        <Link to="/cart" className="btn btn-outline">Back to cart</Link>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <Link to="/cart" className="back-link">
        <IconArrowLeft /> Back to cart
      </Link>

      <h1>Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-form">
          <h2>Shipping Address</h2>
          {error && <div className="form-error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                rows="3"
                placeholder="Street, city, landmark, phone number..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || items.length === 0}
            >
              {submitting ? 'Processing…' : `Place Order — ${formatBirr(total)}`}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="summary-items">
            {items.map((item) => {
              const price = item.negotiated_price || item.price;
              return (
                <div key={item.id} className="summary-item">
                  <span>{item.product_name}</span>
                  <span>{item.quantity} × {formatBirr(price)}</span>
                </div>
              );
            })}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatBirr(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Commission (8%)</span>
            <span>{formatBirr(commission)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{formatBirr(delivery)}</span>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span>{formatBirr(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
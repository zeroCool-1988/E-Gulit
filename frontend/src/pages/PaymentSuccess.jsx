import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/apiClient';
import '../styles/PaymentSuccess.css';

function IconCheck() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="1.5" />
      <path d="M8 12l2.5 2.5L16 9" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatBirr(amount) {
  return `${Number(amount).toLocaleString('en-US')} birr`;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tx_ref = searchParams.get('ref');

  useEffect(() => {
    if (!tx_ref) {
      setLoading(false);
      setError('No order reference found.');
      return;
    }

    api.get(`/orders/ref/${tx_ref}`, { auth: false })
      .then((data) => {
        setOrder(data.data || data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load order details.');
        setLoading(false);
      });
  }, [tx_ref]);

  if (loading) {
    return (
      <div className="container payment-page">
        <div className="payment-card">
          <div className="verify-loader" />
          <h2>Loading order details…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container payment-page">
      <div className="payment-card">
        <IconCheck />
        <h1>Payment Successful!</h1>
        <p>Your order has been placed and will be processed shortly.</p>

        {error && (
          <div className="form-error-banner">{error}</div>
        )}

        {order ? (
          <div className="order-details">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Receipt</h3>
            <p><strong>Order Reference:</strong> {order.order_ref}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Paid:</strong> {formatBirr(order.total)}</p>
            <p><strong>Delivery Address:</strong> {order.address}</p>

            {order.items && order.items.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
                <p><strong>Items:</strong></p>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '4px 0' }}>
                    <span>{item.qty}x {item.product_name}</span>
                    <span>{formatBirr(item.price_at_purchase || item.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-faint)', marginTop: 16 }}>
            We'll send a confirmation email with your order details.
          </p>
        )}

        <div className="action-buttons">
          <Link to="/orders" className="btn btn-primary">View Orders</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
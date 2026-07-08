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

function IconPrinter() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 6V4a1 1 0 011-1h8a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="4" y="9" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 13h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.333 3.333h4M3.333 3.333v4M3.333 3.333l6 6M12.667 10v3.333h-10V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatBirr(amount) {
  return `${Number(amount).toLocaleString('en-US')} birr`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container payment-page">
        <div className="payment-card">
          <div className="verify-loader" />
          <h2>Loading your receipt…</h2>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container payment-page">
        <div className="payment-card">
          <h1>Payment Successful!</h1>
          <p>Your order has been placed. We'll send a confirmation email with details.</p>
          <div className="action-buttons">
            <Link to="/orders" className="btn btn-primary">View Orders</Link>
            <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container payment-page">
      <div className="payment-card receipt-card">
        <div className="receipt-header">
          <IconCheck />
          <h1>Payment Successful!</h1>
          <p>Order #{order.order_ref}</p>
        </div>

        <div className="receipt-body">
          <div className="receipt-section">
            <h3>Order Details</h3>
            <div className="receipt-row">
              <span>Date</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="receipt-row">
              <span>Status</span>
              <span className="status-badge" style={{ backgroundColor: '#2e7d32' }}>Paid</span>
            </div>
            <div className="receipt-row">
              <span>Reference</span>
              <span>{order.order_ref}</span>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Items</h3>
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="receipt-item">
                  <span>{item.qty}x {item.product_name}</span>
                  <span>{formatBirr(item.price_at_purchase || item.price)}</span>
                </div>
              ))
            ) : (
              <p>No items found.</p>
            )}
          </div>

          <div className="receipt-section">
            <h3>Payment Summary</h3>
            <div className="receipt-row">
              <span>Subtotal</span>
              <span>{formatBirr(order.subtotal)}</span>
            </div>
            <div className="receipt-row">
              <span>Commission</span>
              <span>{formatBirr(order.commission)}</span>
            </div>
            <div className="receipt-row">
              <span>Delivery</span>
              <span>{formatBirr(order.delivery)}</span>
            </div>
            <div className="receipt-row total">
              <span><strong>Total Paid</strong></span>
              <span><strong>{formatBirr(order.total)}</strong></span>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Delivery Address</h3>
            <p>{order.address}</p>
          </div>

          <div className="receipt-footer">
            <p>Thank you for shopping with E-Gulit!</p>
            <p className="receipt-small">A confirmation email has been sent to you.</p>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-outline" onClick={handlePrint}>
            <IconPrinter /> Print Receipt
          </button>
          {order.chapa_ref && (
            <a
              href={`https://chapa.link/payment-receipt/${order.chapa_ref}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <IconExternal /> View on Chapa
            </a>
          )}
          <Link to="/orders" className="btn btn-primary">View Orders</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
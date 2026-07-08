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
  const tx_ref = searchParams.get('ref');

  useEffect(() => {
    if (!tx_ref) {
      setLoading(false);
      return;
    }

    api.get(`/orders/ref/${tx_ref}`, { auth: false })
      .then((data) => {
        setOrder(data.data || data);
        setLoading(false);
      })
      .catch(() => {
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

        {order && (
          <div className="order-details">
            <p><strong>Order Reference:</strong> {order.order_ref}</p>
            <p><strong>Total Paid:</strong> {formatBirr(order.total)}</p>
            <p><strong>Delivery Address:</strong> {order.address}</p>
            <p><strong>Status:</strong> {order.status}</p>
          </div>
        )}

        <div className="action-buttons">
          <Link to="/orders" className="btn btn-primary">View Orders</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
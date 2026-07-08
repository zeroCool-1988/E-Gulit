import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import '../styles/OrderDetail.css';

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

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status) {
  const colors = {
    pending: '#f57c00',
    paid: '#2e7d32',
    processing: '#1565c0',
    shipped: '#6a1b9a',
    delivered: '#1b5e20',
    cancelled: '#d32f2f',
  };
  return colors[status] || '#666';
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  function fetchOrder() {
    setLoading(true);
    api.get(`/orders/${id}`)
      .then((data) => {
        setOrder(data.data || data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load order.');
        setLoading(false);
      });
  }

  async function handlePayNow() {
    setPaying(true);
    try {
        const token = localStorage.getItem('egulit_access_token');
        const res = await fetch(`http://localhost:3000/api/orders/${id}/pay`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        });
        const data = await res.json();
        if (data.success && data.data?.payment_url) {
        window.location.href = data.data.payment_url;
        } else {
        alert('Could not initiate payment.');
        setPaying(false);
        }
    } catch (err) {
        alert(err.message || 'Payment initiation failed.');
        setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="container order-detail-page">
        <h1>Order Details</h1>
        <div className="order-detail-skeleton">
          <div className="skeleton-line" style={{ height: 40, marginBottom: 20 }} />
          <div className="skeleton-line" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container order-detail-page">
        <h1>Order Details</h1>
        <div className="form-error-banner">{error || 'Order not found'}</div>
        <Link to="/orders" className="btn btn-outline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="container order-detail-page">
      <Link to="/orders" className="back-link">
        <IconArrowLeft /> Back to Orders
      </Link>

      <h1>Order #{order.order_ref}</h1>

      <div className="order-detail-grid">
        <div className="order-detail-section">
          <h2>Order Information</h2>
          <div className="order-info-row">
            <span className="label">Status</span>
            <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
              {order.status}
            </span>
          </div>
          <div className="order-info-row">
            <span className="label">Date</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="order-info-row">
            <span className="label">Payment Status</span>
            <span>{order.payment_status || 'pending'}</span>
          </div>
          <div className="order-info-row">
            <span className="label">Delivery Address</span>
            <span>{order.address}</span>
          </div>

          {order.status === 'pending' && (
            <div className="order-action-row">
              <button
                className="btn btn-primary btn-block"
                onClick={handlePayNow}
                disabled={paying}
              >
                {paying ? 'Processing…' : 'Pay Now'}
              </button>
            </div>
          )}
        </div>

        <div className="order-detail-section">
          <h2>Items</h2>
          {order.items && order.items.length > 0 ? (
            <div className="order-items-list">
              {order.items.map((item) => (
                <div key={item.id} className="order-item-row">
                  <span className="item-name">{item.qty}x {item.product_name}</span>
                  <span className="item-price">{formatBirr(item.price_at_purchase || item.price)}</span>
                </div>
              ))}
              <div className="order-total-row">
                <span>Total</span>
                <span className="total-amount">{formatBirr(order.total)}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-faint)' }}>No items found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
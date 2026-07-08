import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getStoredUser } from '../api/apiClient';
import '../styles/Orders.css';

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

function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6.5L10 3l7 3.5-7 3.5-7-3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 6.5v7L10 17l7-3.5v-7M10 10v7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('incoming');

  const user = getStoredUser();
  const isSeller = user?.role === 'seller';

  function fetchOrders(filterType) {
    setLoading(true);
    const query = isSeller ? `?filter=${filterType}` : '';
    api.get(`/orders${query}`)
      .then((data) => {
        setOrders(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load orders.');
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  if (loading) {
    return (
      <div className="container orders-page">
        <h1>My Orders</h1>
        <div className="orders-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-line" style={{ height: 100, marginBottom: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container orders-page">
        <h1>My Orders</h1>
        <div className="form-error-banner">{error}</div>
        <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        {isSeller && (
          <div className="orders-toggle">
            <button
              className={`toggle-btn ${filter === 'incoming' ? 'active' : ''}`}
              onClick={() => setFilter('incoming')}
            >
              Incoming Orders
            </button>
            <button
              className={`toggle-btn ${filter === 'purchases' ? 'active' : ''}`}
              onClick={() => setFilter('purchases')}
            >
              My Purchases
            </button>
          </div>
        )}
      </div>
      <p className="orders-count">{orders.length} order{orders.length > 1 ? 's' : ''}</p>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <IconAlert />
          <h2>No orders yet</h2>
          <p>Start shopping and place your first order.</p>
          <Link to="/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-ref">
                  <IconBox />
                  <span>{order.order_ref}</span>
                </div>
                <span className="order-date">{formatDate(order.created_at)}</span>
              </div>
              <div className="order-body">
                <div className="order-items">
                  {order.items?.slice(0, 3).map((item) => (
                    <span key={item.id} className="order-item-name">
                      {item.qty}x {item.product_name}
                    </span>
                  ))}
                  {order.items?.length > 3 && (
                    <span className="order-item-more">+{order.items.length - 3} more</span>
                  )}
                </div>
                <div className="order-footer">
                  <span className="order-total">{formatBirr(order.total)}</span>
                  <span
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
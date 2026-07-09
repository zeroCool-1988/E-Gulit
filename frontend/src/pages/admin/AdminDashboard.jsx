import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getStoredUser, clearTokens } from '../../api/apiClient';
import '../../styles/AdminDashboard.css';

function IconUsers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6.5L12 3l9 3.5-9 3.5-9-3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 6.5v7L12 20l9-3.5v-7M12 12v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconOrder() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8h8M8 12h6M8 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 5.5h12l-1.1 11a2 2 0 01-2 1.8H7.1a2 2 0 01-2-1.8L4 5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.5 5.5V4a1.5 1.5 0 013 0v1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 9v5.5M11.5 9v5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M15.5 4.5a8 8 0 00-11 0M17 2v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 15.5a8 8 0 0011 0M3 18v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5v4.2M10 13.3h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="#2e7d32" strokeWidth="1.5" />
      <path d="M6.5 10l2.5 2.5L13.5 8" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="#d32f2f" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#d32f2f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatBirr(amount) {
  return `${Number(amount).toLocaleString('en-US')} birr`;
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();

  function fetchData() {
    setLoading(true);
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/products'),
      api.get('/admin/orders'),
      api.get('/admin/stats'),
    ])
      .then(([usersRes, productsRes, ordersRes, statsRes]) => {
        setUsers(usersRes.data?.data || usersRes.data || []);
        setProducts(productsRes.data?.data || productsRes.data || []);
        setOrders(ordersRes.data?.data || ordersRes.data || []);
        setStats(statsRes.data?.data || statsRes.data || {});
        setLoading(false);
      })
      .catch((err) => {
        if (err.message === 'Invalid token') {
          clearTokens();
          navigate('/admin/login');
        } else {
          setError(err.message || 'Could not load admin data.');
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function toggleVerifySeller(userId) {
    setVerifying(userId);
    try {
      await api.patch(`/admin/users/${userId}/verify`);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_verified_seller: true } : u
      ));
    } catch (err) {
      alert(err.message || 'Could not verify seller.');
    } finally {
      setVerifying(null);
    }
  }

  async function deleteProduct(productId) {
    if (!confirm('Delete this product permanently? This cannot be undone.')) return;
    setDeleting(productId);
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.message || 'Could not delete product.');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="container admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div className="admin-skeleton">
          <div className="skeleton-line" style={{ height: 100 }} />
          <div className="skeleton-line" style={{ height: 200, marginTop: 20 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div className="form-error-banner">{error}</div>
        <button className="btn btn-outline" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="container admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={fetchData}>
            <IconRefresh /> Refresh
          </button>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => { clearTokens(); navigate('/'); }}
            style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <IconUsers />
          <div>
            <span className="stat-number">{stats.users || users.length}</span>
            <span className="stat-label">Users</span>
          </div>
        </div>
        <div className="stat-card">
          <IconBox />
          <div>
            <span className="stat-number">{stats.products || products.length}</span>
            <span className="stat-label">Products</span>
          </div>
        </div>
        <div className="stat-card">
          <IconOrder />
          <div>
            <span className="stat-number">{stats.orders || orders.length}</span>
            <span className="stat-label">Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-number">{formatBirr(stats.revenue || 0)}</span>
          <span className="stat-label">Revenue</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({orders.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>Users</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified Seller</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.account_role || u.role}</td>
                    <td>
                      {u.is_verified_seller ? <IconCheck /> : <IconX />}
                    </td>
                    <td>{formatBirr(u.wallet_balance || 0)}</td>
                    <td>
                      {u.account_role === 'seller' && !u.is_verified_seller && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => toggleVerifySeller(u.id)}
                          disabled={verifying === u.id}
                        >
                          {verifying === u.id ? '...' : 'Verify'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="admin-section">
          <h2>All Products</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Seller</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.product_name}</td>
                    <td>{formatBirr(p.price)}</td>
                    <td>{p.quantity_in_stock}</td>
                    <td>{p.seller_name || 'Unknown'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteProduct(p.id)}
                        disabled={deleting === p.id}
                      >
                        {deleting === p.id ? '...' : <IconTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-section">
          <h2>All Orders</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Buyer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.order_ref}</td>
                    <td>{o.username || 'Unknown'}</td>
                    <td>{formatBirr(o.total)}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(o.status) }}>
                        {o.status}
                      </span>
                    </td>
                    <td>{o.payment_status}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
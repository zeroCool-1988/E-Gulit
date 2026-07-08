import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getStoredUser } from '../../api/apiClient';
import '../../styles/SellerDashboard.css';

function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6.5L10 3l7 3.5-7 3.5-7-3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 6.5v7L10 17l7-3.5v-7M10 10v7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M9.5 3H5a2 2 0 00-2 2v4.5c0 .53.21 1.04.59 1.41l7 7a2 2 0 002.82 0l3.68-3.68a2 2 0 000-2.82l-7-7A2 2 0 009.5 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="6.5" cy="6.5" r="1.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6h14a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M14 6V5a2 2 0 00-4 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14" cy="11" r="1.2" fill="currentColor" />
    </svg>
  );
}

function formatBirr(amount) {
  return `${Number(amount).toLocaleString('en-US')} birr`;
}

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [balance, setBalance] = useState(0);

  const user = getStoredUser();

  function fetchProducts() {
    setLoading(true);
    api.get('/products?seller_id=' + user.id)
      .then((res) => {
        const productList = res.data?.data || res.data || [];
        setProducts(productList);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load products.');
        setLoading(false);
      });
  }

  function fetchOrders() {
    api.get('/orders')
      .then((res) => {
        const orderList = res.data?.data || res.data || [];
        setOrders(orderList);
      })
      .catch((err) => {
        if (err.message === 'Invalid token') {
          localStorage.removeItem('egulit_access_token');
          localStorage.removeItem('egulit_refresh_token');
          window.location.href = '/login';
        } else {
          console.error('Could not load orders:', err);
        }
      });
  }

  function fetchBalance() {
    api.get('/auth/profile')
      .then((res) => {
        const userData = res.data?.data || res.data || res;
        const balanceValue = parseFloat(userData.wallet_balance) || 
                            parseFloat(userData.balance) || 0;
        setBalance(balanceValue);
      })
      .catch((err) => {
        if (err.message === 'Invalid token') {
          localStorage.removeItem('egulit_access_token');
          localStorage.removeItem('egulit_refresh_token');
          window.location.href = '/login';
        } else {
          console.error('Could not load balance:', err);
          setBalance(0);
        }
      });
  }

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchBalance();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
        fetchProducts();
        fetchBalance();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message || 'Could not delete product.');
    }
  }

  if (loading) {
    return (
      <div className="container seller-dashboard">
        <h1>Dashboard</h1>
        <div className="dashboard-skeleton">
          <div className="skeleton-line" style={{ height: 100 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container seller-dashboard">
        <h1>Dashboard</h1>
        <div className="form-error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="container seller-dashboard">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => { fetchProducts(); fetchOrders(); fetchBalance(); }}>
            Refresh
          </button>
          <Link to="/seller/products/new" className="btn btn-primary">
            Add Product
          </Link>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <IconBox />
          <div>
            <span className="stat-number">{products.length}</span>
            <span className="stat-label">Products</span>
          </div>
        </div>
        <div className="stat-card">
          <IconTag />
          <div>
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <IconWallet />
          <div>
            <span className="stat-number">{formatBirr(balance)}</span>
            <span className="stat-label">Balance</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Products</h2>
        {products.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Start by adding your first product.</p>
            <Link to="/seller/products/new" className="btn btn-primary">Add Product</Link>
          </div>
        ) : (
          <div className="product-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Negotiable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.product_name}</td>
                    <td>{formatBirr(p.price)}</td>
                    <td>{p.quantity_in_stock}</td>
                    <td>{p.is_negotiable ? 'Yes' : 'No'}</td>
                    <td>
                      <Link to={`/seller/products/${p.id}/edit`} className="btn btn-sm btn-outline">
                        Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteProduct(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import VerifyAccount from './pages/VerifyAccount.jsx';
import { getStoredUser, clearTokens } from './api/apiClient';
import Cart from './pages/Cart';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail';
import SellerDashboard from './pages/seller/SellerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

function ShopIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h16l-1.2 10.3a2 2 0 01-2 1.7H7.2a2 2 0 01-2-1.7L4 8z" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 8V6a4 4 0 018 0v2" stroke="var(--color-secondary)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 12h5" stroke="var(--color-text-muted)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      {open ? (
        <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <>
          <path d="M3 6h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 11h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function getDisplayName(user) {
  const fullName = user?.full_name || user?.fullName || '';
  const firstName = fullName.trim().split(/\s+/)[0];
  return firstName || user?.username || 'there';
}

function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          <ShopIcon />
          <span>
            E-Gulit<span className="nav-logo-dot">.</span>
          </span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <Link to="/shop">Shop</Link>
          {user && <Link to="/orders">Orders</Link>}
          {user && <Link to="/cart">Cart</Link>}
          {user?.role === 'seller' && <Link to="/dashboard">Dashboard</Link>}
          <div className="nav-divider" />
          {user ? (
            <>
              <span className="nav-user">Hello, {getDisplayName(user)}</span>
              <button className="btn btn-outline nav-btn" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-plain">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary nav-btn">
                Register
              </Link>
            </>
          )}
        </nav>

        <button className="nav-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
          <MenuIcon open={menuOpen} />
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="nav-logo footer-logo-text">
            <ShopIcon />
            <span>E-Gulit</span>
          </div>
          <p>A fair-price marketplace for Ethiopia — bargain openly, buy with confidence.</p>
        </div>
        <div className="footer-cols">
          <div>
            <div className="eyebrow">Marketplace</div>
            <Link to="/shop">Shop all</Link>
            <Link to="/register">Sell on E-Gulit</Link>
          </div>
          <div>
            <div className="eyebrow">Account</div>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} E-Gulit. Built for the bargain.</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  function handleLogout() {
    clearTokens();
    setUser(null);
    navigate('/');
  }

  const needsVerification = Boolean(user && !user.isEmailVerified && !user.emailVerified && location.pathname !== '/verify-account');

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Skip to content</a>
      {needsVerification && (
        <div className="verification-banner">
          <span>Verify your email to keep your account secure and unlock the full marketplace experience.</span>
          <Link to="/verify-account" className="btn btn-outline verification-banner-action">Verify now</Link>
        </div>
      )}
      <Navbar user={user} onLogout={handleLogout} />
      <main id="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/dashboard" element={ <ProtectedRoute roles={['seller']}> <SellerDashboard /> </ProtectedRoute> }/>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
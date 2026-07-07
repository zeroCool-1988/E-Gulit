import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Shop from './pages/Shop.jsx';
import VerifyAccount from './pages/VerifyAccount.jsx';
import { getStoredUser, clearTokens } from './api/apiClient';

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

function Navbar() {
  const [user, setUser] = useState(getStoredUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(getStoredUser());
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    clearTokens();
    setUser(null);
    navigate('/');
  }

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
          {user?.role === 'seller' && <Link to="/dashboard">Dashboard</Link>}
          <div className="nav-divider" />
          {user ? (
            <>
              <span className="nav-user">Hello, {getDisplayName(user)}</span>
              <button className="btn btn-outline nav-btn" onClick={handleLogout}>
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

      <style>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(28, 21, 18, 0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--color-border);
        }
        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 600;
        }
        .nav-logo-dot { color: var(--color-accent); }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 22px;
          font-size: 0.92rem;
        }
        .nav-links a { color: var(--color-text-muted); transition: color 0.15s ease; }
        .nav-links a:hover { color: var(--color-text); }
        .nav-link-plain { color: var(--color-text) !important; font-weight: 600; }
        .nav-divider { width: 1px; height: 20px; background: var(--color-border-light); }
        .nav-user { color: var(--color-text); font-weight: 600; font-size: 0.9rem; }
        .nav-btn { padding: 9px 16px; font-size: 0.88rem; }
        .nav-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--color-text);
          cursor: pointer;
        }
        @media (max-width: 760px) {
          .nav-toggle { display: block; }
          .nav-links {
            position: absolute;
            top: 68px;
            left: 0;
            right: 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 20px 24px 26px;
            background: var(--color-bg-elevated);
            border-bottom: 1px solid var(--color-border);
            display: none;
          }
          .nav-links-open { display: flex; }
          .nav-divider { display: none; }
        }
      `}</style>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="nav-logo" style={{ fontSize: '1.15rem' }}>
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

      <style>{`
        .site-footer {
          border-top: 1px solid var(--color-border);
          margin-top: 80px;
          padding-top: 48px;
          background: var(--color-bg-elevated);
        }
        .footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
          padding-bottom: 36px;
        }
        .footer-brand { max-width: 340px; }
        .footer-brand p { margin-top: 12px; font-size: 0.9rem; }
        .footer-cols { display: flex; gap: 56px; }
        .footer-cols a { display: block; color: var(--color-text-muted); font-size: 0.9rem; margin-top: 10px; }
        .footer-cols a:hover { color: var(--color-text); }
        .footer-bottom {
          border-top: 1px solid var(--color-border);
          padding: 18px 24px;
          font-size: 0.8rem;
          color: var(--color-text-faint);
        }
      `}</style>
    </footer>
  );
}

export default function App() {
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

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
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
        </Routes>
      </main>
      <Footer />

      <style>{`
        .verification-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: rgba(232, 163, 61, 0.14);
          border-bottom: 1px solid rgba(232, 163, 61, 0.22);
          padding: 10px 16px;
          font-size: 0.92rem;
          color: var(--color-text);
        }
        .verification-banner-action { padding: 7px 12px; font-size: 0.82rem; }
        @media (max-width: 760px) {
          .verification-banner { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, getStoredUser, setStoredUser } from '../api/apiClient';
import '../styles/VerifyAccount.css';

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 5.5l6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function VerifyAccount() {
  const location = useLocation();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Check your inbox and confirm your email so you can use the full marketplace experience.');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) return;

    let ignore = false;
    async function verifyToken() {
      setLoading(true);
      try {
        const data = await api.get(`/auth/verify/${token}`, { auth: false });
        if (!ignore) {
          setStatus('success');
          setMessage(data?.message || 'Your email has been verified. You can keep browsing now.');
          const storedUser = getStoredUser();
          if (storedUser) {
            setStoredUser({ ...storedUser, isEmailVerified: true, emailVerified: true });
          }
        }
      } catch (err) {
        if (!ignore) {
          setStatus('error');
          setMessage(err.message || 'We could not verify that link. Please request a fresh one.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    verifyToken();
    return () => {
      ignore = true;
    };
  }, [location.search]);

  async function handleResend() {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await api.post('/auth/resend-verification', { email: user.email }, { auth: false });
      setStatus('success');
      setMessage(data?.message || 'A fresh verification email is on its way.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'We could not send another email right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container verify-card">
        <div className="eyebrow">Account verification</div>
        <h1 className="auth-title">Verify your account</h1>
        <p className="auth-sub">We sent a confirmation link to your email so your account stays secure.</p>

        <div className={`verify-banner ${status === 'error' ? 'verify-banner-error' : ''}`}>
          <IconMail />
          <div>
            <strong>{status === 'success' ? 'All set' : 'Almost there'}</strong>
            <p>{message}</p>
          </div>
        </div>

        <div className="verify-actions">
          <button className="btn btn-primary" onClick={handleResend} disabled={loading || !user?.email}>
            {loading ? 'Sending…' : 'Resend verification email'}
          </button>
          <Link to="/shop" className="btn btn-outline">
            Continue browsing
          </Link>
        </div>
      </div>
    </div>
  );
}

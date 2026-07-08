import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getStoredUser, setStoredUser } from '../api/apiClient';
import '../styles/VerifyEmail.css';

function IconCheck() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/auth/verify/${token}`, { auth: false })
      .then((data) => {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        const user = getStoredUser();
        if (user) {
          user.isEmailVerified = true;
          user.emailVerified = true;
          setStoredUser(user);
        }
        setTimeout(() => {
          navigate('/shop', { replace: true });
        }, 2000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Invalid or expired verification link.');
      });
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="container verify-page">
        <div className="verify-card">
          <div className="verify-loader" />
          <h2>Verifying your email…</h2>
          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container verify-page">
      <div className={`verify-card verify-${status}`}>
        {status === 'success' ? <IconCheck /> : <IconAlert />}
        <h2>{status === 'success' ? 'Email Verified!' : 'Verification Failed'}</h2>
        <p>{message}</p>
        <Link to="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
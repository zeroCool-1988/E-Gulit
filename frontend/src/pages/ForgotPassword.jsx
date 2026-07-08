import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import '../styles/ForgotPassword.css';
import '../styles/Login.css';

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 5.5l6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const result = await api.post('/auth/forgot-password', { email }, { auth: false });
      setStatus('sent');
      setMessage(result.message || 'Check your email for the reset link.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Could not send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container reset-card">
        <div className="eyebrow">Password reset</div>
        <h1 className="auth-title">Forgot your password?</h1>
        <p className="auth-sub">
          Enter the email address you used to register, and we'll send you a link to reset your password.
        </p>

        {status === 'sent' && (
          <div className="form-success-banner">
            {message}
            <div style={{ marginTop: 12 }}>
              <Link to="/login" className="btn btn-outline">Back to login</Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="form-error-banner">{message}</div>
        )}

        {status !== 'sent' && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-icon">
                <IconMail />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
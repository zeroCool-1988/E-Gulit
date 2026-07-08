import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import '../styles/ResetPassword.css';
import '../styles/Login.css';

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValid = password.length >= 6 && password === confirm;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setStatus('idle');

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      }, { auth: false });

      setStatus('success');
      setMessage('Your password has been reset successfully.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Could not reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container reset-card">
        <div className="eyebrow">Reset password</div>
        <h1 className="auth-title">Choose a new password</h1>

        {status === 'success' && (
          <div className="form-success-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconCheck style={{ flexShrink: 0 }} />
              <span>{message}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="form-error-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconAlert style={{ flexShrink: 0 }} />
              <span>{message}</span>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <>
            <p className="auth-sub">Create a new password for your E-Gulit account.</p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="password">New password</label>
                <div className="input-icon">
                  <IconLock />
                  <input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <div className="input-icon">
                  <IconLock />
                  <input
                    id="confirm"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                {confirm && password !== confirm && (
                  <p className="field-help field-help-error">Passwords do not match.</p>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading || !isValid}>
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer">
          <Link to="/login" className="auth-link">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
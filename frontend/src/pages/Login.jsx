import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api, setTokens, setStoredUser } from '../api/apiClient';
import '../styles/Login.css';

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 5.5l6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconEye({ off }) {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      {off && <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
    </svg>
  );
}
function IconTicketStub() {
  return (
    <svg viewBox="0 0 200 260" width="100%" aria-hidden="true">
      <path
        d="M14 10h172a4 4 0 014 4v40l-7 7 7 7v40l-7 7 7 7v40l-7 7 7 7v40a4 4 0 01-4 4H14a4 4 0 01-4-4v-40l7-7-7-7v-40l7-7-7-7V54l7-7-7-7V14a4 4 0 014-4z"
        fill="var(--color-bg-elevated)"
        stroke="var(--color-border-light)"
      />
      <circle cx="14" cy="130" r="6" fill="var(--color-bg)" />
      <circle cx="186" cy="130" r="6" fill="var(--color-bg)" />
      <text x="28" y="44" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="2" fill="var(--color-secondary)">ADMIT ONE BUYER</text>
      <line x1="28" y1="56" x2="172" y2="56" stroke="var(--color-border-light)" strokeDasharray="3 4" />
      <text x="28" y="90" fontFamily="Fraunces, serif" fontSize="18" fill="var(--color-text)">Welcome</text>
      <text x="28" y="112" fontFamily="Fraunces, serif" fontSize="18" fill="var(--color-text)">back to the</text>
      <text x="28" y="134" fontFamily="Fraunces, serif" fontSize="18" fill="var(--color-accent)">market floor.</text>
      <line x1="28" y1="150" x2="172" y2="150" stroke="var(--color-border-light)" strokeDasharray="3 4" />
      <text x="28" y="176" fontFamily="Inter, sans-serif" fontSize="10.5" fill="var(--color-text-faint)">Sign in to check offers,</text>
      <text x="28" y="192" fontFamily="Inter, sans-serif" fontSize="10.5" fill="var(--color-text-faint)">track orders, and keep</text>
      <text x="28" y="208" fontFamily="Inter, sans-serif" fontSize="10.5" fill="var(--color-text-faint)">bargaining.</text>
    </svg>
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.post('/auth/login', form, { auth: false });
      const { user, accessToken, refreshToken } = result.data;
      setTokens({ accessToken, refreshToken });
      setStoredUser(user);
      const redirectTo = location.state?.from?.pathname || '/shop';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container auth-grid">
        <div className="auth-visual">
          <IconTicketStub />
        </div>

        <div className="auth-card">
          <div className="eyebrow">Sign in</div>
          <h1 className="auth-title">Log in to your account</h1>
          <p className="auth-sub">Pick up where your last negotiation left off.</p>

          {error && <div className="form-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="input-icon">
                <IconMail />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-icon">
                <IconLock />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update('password')}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <IconEye off={showPassword} />
                </button>
              </div>
            </div>

            <div className="auth-row">
              <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <p className="auth-footer">
            New to E-Gulit? <Link to="/register" className="auth-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
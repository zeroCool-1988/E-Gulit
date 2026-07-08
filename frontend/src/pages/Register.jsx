import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setTokens, setStoredUser } from '../api/apiClient';
import '../styles/Register.css';

const USERNAME_REGEX = /^[A-Za-z._]+$/;
const PHONE_REGEX = /^\d{10}$/;
const FULL_NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)+$/;

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 17c1-3.6 4-5.5 6.5-5.5s5.5 1.9 6.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 5.5l6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3.5h2l1.4 3.4-1.7 1.2a9 9 0 004.2 4.2l1.2-1.7L15.5 12v2a1.5 1.5 0 01-1.6 1.5A11.5 11.5 0 013.5 5.1 1.5 1.5 0 015 3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
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
function IconBasket() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9h16l-1.6 10.2a2 2 0 01-2 1.8H7.6a2 2 0 01-2-1.8L4 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 9V7a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 3.5H6a2.5 2.5 0 00-2.5 2.5v5c0 .66.26 1.3.73 1.77l8.5 8.5a2.5 2.5 0 003.54 0l4.46-4.46a2.5 2.5 0 000-3.54l-8.5-8.5A2.5 2.5 0 0011 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function validateUsername(value) {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: 'Username is required.' };
  if (trimmed.length < 4) return { valid: false, message: 'Username must be more than 3 characters.' };
  if (!USERNAME_REGEX.test(trimmed)) return { valid: false, message: 'Use letters, dots, or underscores only.' };
  return { valid: true, message: '' };
}

function validatePhone(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return { valid: false, message: 'Phone number is required.' };
  if (!PHONE_REGEX.test(digits)) return { valid: false, message: 'Phone number must be exactly 10 digits.' };
  return { valid: true, message: '' };
}

function validatePassword(value) {
  if (!value) return { valid: false, message: 'Password is required.' };
  if (value.length <= 8) return { valid: false, message: 'Password must be more than 8 characters.' };
  return { valid: true, message: '' };
}

function validateFullName(value) {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: 'Full name is required.' };
  if (!FULL_NAME_REGEX.test(trimmed)) return { valid: false, message: 'Use letters and spaces only, for example Abebe Bekele.' };
  return { valid: true, message: '' };
}

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'buyer',
    storeName: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState({ status: 'idle', message: '' });
  const navigate = useNavigate();

  const usernameValidation = validateUsername(form.username);
  const phoneValidation = validatePhone(form.phone);
  const passwordValidation = validatePassword(form.password);
  const fullNameValidation = validateFullName(form.fullName);
  const emailValidation = /\S+@\S+\.\S+/.test(form.email);
  const firstName = form.fullName.trim().split(/\s+/)[0] || '';

  const canSubmit = Boolean(form.username.trim()) && usernameValidation.valid && usernameCheck.status === 'success' && phoneValidation.valid && passwordValidation.valid && fullNameValidation.valid && emailValidation && !loading;

  function update(field, transform) {
    return (e) => {
      const rawValue = e.target.value;
      const value = transform ? transform(rawValue) : rawValue;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  useEffect(() => {
    const username = form.username.trim();

    if (!username) {
      setUsernameCheck({ status: 'idle', message: '' });
      return undefined;
    }

    const validation = validateUsername(form.username);
    if (!validation.valid) {
      setUsernameCheck({ status: 'error', message: validation.message });
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        const data = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`, { auth: false });
        if (data?.available) {
          setUsernameCheck({ status: 'success', message: 'Username is available.' });
        } else {
          setUsernameCheck({ status: 'error', message: data?.message || 'Username is already taken.' });
        }
      } catch (err) {
        setUsernameCheck({ status: 'error', message: err.message || 'We could not verify that username right now.' });
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [form.username]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('Please fix the highlighted fields before registering.');
      return;
    }

    setLoading(true);
    try {
      const submittedStoreName = form.role === 'seller'
        ? (form.storeName.trim() || `${firstName || 'Seller'}'s Store`)
        : undefined;
      const payload = {
        username: form.username.trim(),
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone_number: form.phone.replace(/\D/g, ''),
        store_name: submittedStoreName,
        stall_location: form.role === 'seller' ? form.location.trim() || undefined : undefined,
      };

      const result = await api.post('/auth/register', payload, { auth: false });
      const { user, accessToken, refreshToken } = result.data;
      setTokens({ accessToken, refreshToken });
      setStoredUser(user);
      const nextPath = user?.isEmailVerified === false || user?.emailVerified === false ? '/verify-account' : '/shop';
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container register-card">
        <div className="eyebrow">Create account</div>
        <h1 className="auth-title">Join the market</h1>
        <p className="auth-sub">Register as a buyer to start negotiating, or as a seller to list your stock.</p>

        {error && <div className="form-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="role-toggle" role="radiogroup" aria-label="Account type">
            <button
              type="button"
              role="radio"
              aria-checked={form.role === 'buyer'}
              className={`role-option ${form.role === 'buyer' ? 'role-option-active' : ''}`}
              onClick={() => setForm((f) => ({ ...f, role: 'buyer' }))}
            >
              <IconBasket />
              <div>
                <strong>Buyer</strong>
                <span>Browse and negotiate</span>
              </div>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={form.role === 'seller'}
              className={`role-option ${form.role === 'seller' ? 'role-option-active' : ''}`}
              onClick={() => setForm((f) => ({ ...f, role: 'seller' }))}
            >
              <IconTag />
              <div>
                <strong>Seller</strong>
                <span>List and fulfil orders</span>
              </div>
            </button>
          </div>

          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <div className={`input-icon ${fullNameValidation.valid ? 'input-icon-success' : form.fullName ? 'input-icon-error' : ''}`}>
              <IconUser />
              <input id="fullName" placeholder="Abebe Bekele" value={form.fullName} onChange={update('fullName')} required />
            </div>
            {form.fullName && !fullNameValidation.valid && <p className="field-help field-help-error">{fullNameValidation.message}</p>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="username">Username</label>
              <div className={`input-icon ${usernameCheck.status === 'success' ? 'input-icon-success' : usernameCheck.status === 'error' ? 'input-icon-error' : ''}`}>
                <IconUser />
                <input id="username" placeholder="abebe_k" value={form.username} onChange={update('username')} required />
              </div>
              {usernameCheck.message && <p className={`field-help ${usernameCheck.status === 'success' ? 'field-help-success' : 'field-help-error'}`}>{usernameCheck.message}</p>}
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <div className={`input-icon ${phoneValidation.valid ? 'input-icon-success' : form.phone ? 'input-icon-error' : ''}`}>
                <IconPhone />
                <input id="phone" type="tel" placeholder="09xx xxx xxx" value={form.phone} onChange={update('phone', (value) => value.replace(/\D/g, '').slice(0, 10))} required />
              </div>
              {form.phone && !phoneValidation.valid && <p className="field-help field-help-error">{phoneValidation.message}</p>}
            </div>
          </div>

          {form.role === 'seller' && (
            <div className="seller-section">
              <div className="field">
                <label htmlFor="storeName">Store name</label>
                <input id="storeName" placeholder={firstName ? `${firstName}'s Store` : 'Your store name'} value={form.storeName} onChange={update('storeName')} />
              </div>
              <div className="field">
                <label htmlFor="location">Location (optional)</label>
                <input id="location" placeholder="Bole, Addis Ababa" value={form.location} onChange={update('location')} />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="input-icon">
              <IconMail />
              <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className={`input-icon ${passwordValidation.valid ? 'input-icon-success' : form.password ? 'input-icon-error' : ''}`}>
              <IconLock />
              <input
                id="password"
                type="password"
                placeholder="At least 9 characters"
                value={form.password}
                onChange={update('password')}
                minLength={9}
                required
              />
            </div>
            {form.password && !passwordValidation.valid && <p className="field-help field-help-error">{passwordValidation.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit}>
            {loading ? 'Creating account…' : `Register as ${form.role}`}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}

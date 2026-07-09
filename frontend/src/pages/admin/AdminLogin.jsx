import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setTokens, setStoredUser } from '../../api/apiClient';
import '../../styles/AdminLogin.css';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.post('/auth/login', form, { auth: false });
      const { user, accessToken, refreshToken } = result.data;

      if (user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      setTokens({ accessToken, refreshToken });
      setStoredUser(user);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1>Admin Access</h1>
          <p>Restricted to platform administrators only.</p>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="admin@egulit.com"
              required
            />
          </div>

          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in as Admin'}
          </button>
        </form>

        <p className="admin-login-footer">
          <Link to="/login">Return to user login</Link>
        </p>
      </div>
    </div>
  );
}
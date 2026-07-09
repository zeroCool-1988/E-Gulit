const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';

function getAccessToken() {
  return localStorage.getItem('egulit_access_token');
}

function getRefreshToken() {
  return localStorage.getItem('egulit_refresh_token');
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('egulit_access_token', accessToken);
  if (refreshToken) localStorage.setItem('egulit_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('egulit_access_token');
  localStorage.removeItem('egulit_refresh_token');
  localStorage.removeItem('egulit_user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('egulit_user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('egulit_user');
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) {
    localStorage.removeItem('egulit_user');
    return;
  }
  localStorage.setItem('egulit_user', JSON.stringify(user));
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error('Session expired');
  }

  const data = await res.json();
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, auth = true, retry = true } = {}) {
  const finalHeaders = { ...headers };

  if (!(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = {
    method,
    headers: finalHeaders,
  };

  if (body instanceof FormData) {
    fetchOptions.body = body;
  } else if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, fetchOptions);

  if (res.status === 401 && auth && retry) {
    try {
      await refreshAccessToken();
      return apiRequest(path, { method, body, headers, auth, retry: false });
    } catch {
      clearTokens();
      throw new Error('Please sign in again.');
    }
  }

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const message = data?.message || data?.error || 'Please try again.';
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path, opts) => apiRequest(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => apiRequest(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: 'DELETE' }),
};

export default api;
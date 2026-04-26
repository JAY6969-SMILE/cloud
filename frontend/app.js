export const BASE = 'http://localhost:8080/api';

export const getToken = () => localStorage.getItem('jwt');
export const getRole = () => localStorage.getItem('role');
export const setToken = (token) => localStorage.setItem('jwt', token);
export const setRole = (role) => localStorage.setItem('role', role);
export const clearSession = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('role');
};

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiFetch(path, options = {}) {
  const opts = { ...options };
  opts.headers = { ...(options.headers || {}) };

  const res = await fetch(BASE + path, opts);
  if (res.status === 401) {
    location.href = 'auth.html';
    return;
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg = data && typeof data === 'object' && data.error ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export function requireEmployer() {
  if (!getToken() || getRole() !== 'EMPLOYER') {
    location.href = 'auth.html';
    return false;
  }
  return true;
}

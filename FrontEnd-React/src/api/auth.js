const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function register(payload) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

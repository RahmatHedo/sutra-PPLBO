const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const headers = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export async function getAllUsers(token) {
  const res = await fetch(`${API_URL}/api/users`, { headers: headers(token) });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function getUserById(token, id) {
  const res = await fetch(`${API_URL}/api/users/${id}`, { headers: headers(token) });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function updateUser(token, id, payload) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function deleteUser(token, id) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function toggleUserStatus(token, id) {
  const res = await fetch(`${API_URL}/api/users/${id}/toggle-status`, {
    method: 'PATCH',
    headers: headers(token),
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function approveKetua(token, id) {
  const res = await fetch(`${API_URL}/api/users/approve/${id}`, {
    method: 'PATCH',
    headers: headers(token),
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const headers = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export async function getHarvestsByPetani(token) {
  const res = await fetch(`${API_URL}/api/harvests/petani`, { headers: headers(token) });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function getHarvestsForKetua(token) {
  const res = await fetch(`${API_URL}/api/harvests/ketua`, { headers: headers(token) });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function getHarvestStats(token) {
  const res = await fetch(`${API_URL}/api/harvests/stats`, { headers: headers(token) });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function createHarvest(token, payload) {
  // payload: { tanggal_panen, komoditas, jumlah, satuan, lokasi, luas, cuaca, kualitas, catatan, foto_url }
  const res = await fetch(`${API_URL}/api/harvests`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

export async function updateHarvestStatus(token, id, status, catatan = '') {
  const res = await fetch(`${API_URL}/api/harvests/${id}/status`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ status, catatan }),
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

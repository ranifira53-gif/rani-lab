/* Lapisan data: semua data disimpan di database Supabase (PostgreSQL) dan diakses
   lewat fungsi di supabase/schema.sql. Role dicek di server, password di-hash. */
const K = { sess: 'lab_token' };
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };

let token = null;
try { token = localStorage.getItem(K.sess); } catch (e) {}
const setToken = t => { token = t; try { t ? localStorage.setItem(K.sess, t) : localStorage.removeItem(K.sess); } catch (e) {} };

let DB = { items: [], users: [], tx: [] };
let me = null;
let page = 'dashboard';

async function rpc(fn, args = {}) {
  const c = window.CONFIG;
  if (!c || /YOUR/.test(c.SUPABASE_URL + c.SUPABASE_KEY))
    throw new Error('Konfigurasi belum diisi. Isi SUPABASE_URL dan SUPABASE_KEY di js/config.js.');
  const h = { 'Content-Type': 'application/json', apikey: c.SUPABASE_KEY };
  if (c.SUPABASE_KEY.startsWith('eyJ')) h.Authorization = 'Bearer ' + c.SUPABASE_KEY;
  let res;
  try { res = await fetch(`${c.SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: h, body: JSON.stringify(args) }); }
  catch (e) { throw new Error('Tidak bisa terhubung ke server. Periksa koneksi internet lalu coba lagi.'); }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error((body && body.message) || 'Terjadi kesalahan di server.');
  return body;
}

async function refresh() {
  const d = await rpc('get_data', { p_token: token });
  me = d.me; DB = { items: d.items, tx: d.tx, users: d.users };
}
const reload = async () => { await refresh(); render(); };

/* ===== Autentikasi ===== */
function loginView() {
  const rows = [{ nama:'Laptop Lenovo', tersedia:3, stok:5 }, { nama:'Mouse Logitech', tersedia:7, stok:10 }, { nama:'Proyektor Epson', tersedia:3, stok:3 }, { nama:'Monitor LG', tersedia:6, stok:6 }];
  return `<div class="login">
    <section class="art"><div><b>LabInventory</b></div>
      <div><h1>Tahu persis barang lab yang ada di rak.</h1>
      <p>Catat peminjaman dan pengembalian, pantau stok, dan lihat riwayatnya tanpa buku catatan.</p></div>
      <div class="rack" aria-hidden="true">${rows.map(i => `<div><span>${esc(i.nama)}</span><span>${i.tersedia}/${i.stok}</span></div><div class="bar"><i style="width:${i.tersedia / i.stok * 100}%"></i></div>`).join('')}</div>
    </section>
    <section class="form"><form onsubmit="return doLogin(event)">
      <h2>Masuk</h2><p class="hint" style="margin-top:0">Gunakan akun Admin atau Staff.</p>
      <div id="lerr"></div>
      <label>Username<input name="u" autocomplete="username" required autofocus></label>
      <label>Password<input name="p" type="password" autocomplete="current-password" required></label>
      <button class="btn p">Masuk</button>
      <p class="demo">Akun demo:<br>Admin: <b>admin</b> / <b>admin123</b><br>Staff: <b>staff</b> / <b>staff123</b></p>
    </form></section></div>`;
}
async function doLogin(e) {
  e.preventDefault();
  const f = new FormData(e.target), set = m => $('#lerr').innerHTML = `<div class="err">${esc(m)}</div>`, btn = e.target.querySelector('.btn');
  btn.disabled = true; btn.textContent = 'Memeriksa...';
  try {
    const r = await rpc('login', { p_username: f.get('u').trim(), p_password: f.get('p') });
    setToken(r.token);
    location.href = r.user.role === 'admin' ? 'admin.html' : 'staff.html';
  } catch (err) { set(err.message); btn.disabled = false; btn.textContent = 'Masuk'; }
  return false;
}
async function logout() {
  try { await rpc('logout', { p_token: token }); } catch (e) {}
  setToken(null); location.href = 'index.html';
}

/* Halaman login (index.html) */
if (document.body.dataset.page === 'login') {
  $('#app').innerHTML = loginView();
  if (token) refresh().then(() => location.replace(me.role === 'admin' ? 'admin.html' : 'staff.html')).catch(() => setToken(null));
}

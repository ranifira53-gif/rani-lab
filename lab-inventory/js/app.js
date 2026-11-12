/* Titik masuk admin.html dan staff.html. Role halaman ditentukan atribut data-role pada <body>.
   Role sebenarnya tetap dicek di server pada setiap permintaan. */
const PAGE_ROLE = document.body.dataset.role;
(async () => {
  $('#app').innerHTML = '<div class="empty">Memuat data...</div>';
  try { await refresh(); }
  catch (err) {
    if (!token || /sesi/i.test(err.message)) { setToken(null); location.replace('index.html'); return; }
    $('#app').innerHTML = `<div class="empty"><p>${esc(err.message)}</p><button class="btn p" onclick="location.reload()">Coba lagi</button></div>`;
    return;
  }
  if (me.role !== PAGE_ROLE) { location.replace(me.role === 'admin' ? 'admin.html' : 'staff.html'); return; }
  const allowed = NAV.filter(n => !n[2] || n[2] === me.role).map(n => n[0]);
  const fromHash = location.hash.slice(1);
  page = allowed.includes(fromHash) ? fromHash : 'dashboard';
  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (allowed.includes(h) && h !== page) { page = h; render(); }
  });
  render();
})();

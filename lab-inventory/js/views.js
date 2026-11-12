/* ===== Tampilan ===== */
const NAV = [
  ['dashboard','Dashboard'], ['barang','Barang'], ['pinjam','Catat peminjaman'],
  ['kembali','Pengembalian'], ['riwayat','Riwayat'], ['pengguna','Pengguna', 'admin']
];
const stats = () => {
  const total = DB.items.reduce((s, i) => s + i.stok, 0), av = DB.items.reduce((s, i) => s + i.tersedia, 0);
  return { jenis: DB.items.length, total, av, out: total - av, tx: DB.tx.length };
};
const status = i => i.tersedia === 0 ? '<span class="tag bad">Habis</span>' : i.tersedia <= 2 ? '<span class="tag warn">Terbatas</span>' : '<span class="tag ok">Tersedia</span>';
const txTag = t => t.status === 'Selesai' ? '<span class="tag ok">Selesai</span>' : '<span class="tag warn">Dipinjam</span>';
const myTx = () => isAdmin() ? DB.tx : DB.tx.filter(t => t.oleh === me.username);
const head = (t, p, extra = '') => `<div class="head"><div><h1>${t}</h1><p>${p}</p></div>${extra}</div>`;

const views = {
  dashboard() {
    const s = stats(), recent = [...myTx()].sort((a, b) => b.id - a.id).slice(0, 6);
    return head(isAdmin() ? 'Dashboard Admin' : 'Dashboard Staff', 'Ringkasan inventaris dan aktivitas laboratorium.') + `
    <div class="stock">
      <div><b>${s.total}</b><span>Total barang (${s.jenis} jenis)</span></div>
      <div><b>${s.av}</b><span>Barang tersedia</span></div>
      <div><b>${s.out}</b><span>Barang dipinjam</span></div>
      <div><b>${s.tx}</b><span>Total transaksi</span></div>
    </div>
    <div class="meter"><div class="bar" title="Bagian hijau: tersedia"><i style="width:${s.total ? s.av / s.total * 100 : 0}%"></i></div>
      <p><span>Tersedia ${s.av}</span><span>Dipinjam ${s.out}</span></p></div>
    <div class="card"><h2>Aktivitas terbaru</h2>${recent.length ? `<ul class="feed">${recent.map(t => `<li>
      <span><b>${esc(t.peminjam)}</b> ${t.status === 'Selesai' ? 'mengembalikan' : 'meminjam'} ${t.qty} ${esc(t.itemNama)}</span>
      <time>${fmt(t.status === 'Selesai' ? t.tglKembali : t.tglPinjam)}</time></li>`).join('')}</ul>` : '<div class="empty">Belum ada aktivitas. Catat peminjaman pertama dari menu Catat peminjaman.</div>'}</div>`;
  },
  barang() {
    return head('Barang', isAdmin() ? 'Kelola data barang laboratorium.' : 'Lihat daftar barang dan ketersediaannya.',
      isAdmin() ? '<button class="btn p" onclick="itemForm()">Tambah barang</button>' : '') + `
    <div class="tools"><input id="q" type="search" placeholder="Cari kode, nama, atau kategori" oninput="$('#rows').innerHTML=itemRows(this.value)"></div>
    <div class="tw"><table><thead><tr><th>Kode</th><th>Nama barang</th><th>Kategori</th><th class="num">Stok</th><th>Ketersediaan</th><th>Status</th>${isAdmin() ? '<th></th>' : ''}</tr></thead>
    <tbody id="rows">${itemRows('')}</tbody></table></div>`;
  },
  pinjam() {
    const av = DB.items.filter(i => i.tersedia > 0);
    return head('Catat peminjaman', 'Isi data peminjam dan barang yang dipinjam.') + `
    <div class="card" style="max-width:640px"><form onsubmit="return doBorrow(event)"><div id="ferr"></div>
      <div class="grid2"><label>Nama peminjam<input name="peminjam" required maxlength="60"></label>
      <label>Tanggal peminjaman<input name="tgl" type="date" value="${today()}" required></label></div>
      <label>Barang<select name="itemId" required><option value="">Pilih barang</option>
        ${av.map(i => `<option value="${i.id}">${esc(i.kode)} - ${esc(i.nama)} (tersedia ${i.tersedia})</option>`).join('')}</select></label>
      <label>Jumlah<input name="qty" type="number" min="1" value="1" required></label>
      <label>Catatan (opsional)<input name="catatan" maxlength="120"></label>
      <button class="btn p">Simpan transaksi</button></form></div>`;
  },
  kembali() {
    const act = DB.tx.filter(t => t.status === 'Dipinjam').sort((a, b) => b.id - a.id);
    return head('Pengembalian', 'Proses pengembalian dari daftar barang yang sedang dipinjam.') +
      (act.length ? `<div class="tw"><table><thead><tr><th>Peminjam</th><th>Barang</th><th class="num">Jumlah</th><th>Tanggal pinjam</th><th></th></tr></thead><tbody>
      ${act.map(t => `<tr><td>${esc(t.peminjam)}</td><td>${esc(t.itemNama)}</td><td class="num">${t.qty}</td><td>${fmt(t.tglPinjam)}</td>
      <td class="act"><button class="btn s p" onclick="returnTx(${t.id})">Kembalikan</button></td></tr>`).join('')}</tbody></table></div>`
      : '<div class="card empty">Tidak ada barang yang sedang dipinjam.</div>');
  },
  riwayat() {
    return head('Riwayat transaksi', isAdmin() ? 'Seluruh peminjaman dan pengembalian.' : 'Transaksi yang kamu catat.') + `
    <div class="tools"><input id="hq" type="search" placeholder="Cari peminjam atau barang" oninput="filterTx()">
      <select id="hs" onchange="filterTx()"><option value="">Semua status</option><option>Dipinjam</option><option>Selesai</option></select></div>
    <div class="tw"><table><thead><tr><th>Peminjam</th><th>Barang</th><th class="num">Jumlah</th><th>Dipinjam</th><th>Dikembalikan</th><th>Status</th>${isAdmin() ? '<th>Dicatat oleh</th>' : ''}</tr></thead>
    <tbody id="trows">${txRows('', '')}</tbody></table></div>`;
  },
  pengguna() {
    return head('Pengguna', 'Kelola akun Staff laboratorium.', '<button class="btn p" onclick="userForm()">Tambah Staff</button>') + `
    <div class="tw"><table><thead><tr><th>Nama</th><th>Username</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>
    ${DB.users.map(u => `<tr><td>${esc(u.nama)}</td><td>${esc(u.username)}</td><td>${u.role === 'admin' ? 'Admin' : 'Staff'}</td>
      <td>${u.aktif ? '<span class="tag ok">Aktif</span>' : '<span class="tag bad">Nonaktif</span>'}</td>
      <td class="act">${u.role === 'staff' ? `<button class="btn s" onclick="userForm(${u.id})">Ubah</button>
      <button class="btn s ${u.aktif ? 'd' : ''}" onclick="toggleUser(${u.id})">${u.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>` : ''}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
};

function render() {
  const app = $('#app');
  if (!me) { app.innerHTML = loginView(); return; }
  app.innerHTML = `<div class="shell"><aside>
    <div class="brand">LabInventory<small>Inventaris & peminjaman</small></div>
    <nav>${NAV.filter(n => !n[2] || n[2] === me.role).map(n => `<button class="nav ${page === n[0] ? 'on' : ''}" onclick="go('${n[0]}')">${n[1]}</button>`).join('')}</nav>
    <div class="me"><div><b>${esc(me.nama)}</b><span>${isAdmin() ? 'Admin' : 'Staff'}</span></div><button class="btn s" onclick="logout()">Keluar</button></div>
  </aside><main>${views[page]()}</main></div>`;
}

const go = p => { page = p; location.hash = p; render(); window.scrollTo(0, 0); };

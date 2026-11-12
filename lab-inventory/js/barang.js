/* ===== Barang ===== */
function itemRows(q) {
  q = q.toLowerCase();
  const list = DB.items.filter(i => [i.kode, i.nama, i.kategori].some(v => v.toLowerCase().includes(q)));
  if (!list.length) return `<tr><td colspan="7" class="empty">Barang tidak ditemukan. Coba kata kunci lain${isAdmin() ? ' atau tambah barang baru' : ''}.</td></tr>`;
  return list.map(i => `<tr><td>${esc(i.kode)}</td><td>${esc(i.nama)}</td><td>${esc(i.kategori)}</td><td class="num">${i.stok}</td>
    <td><div class="bar" title="${i.tersedia} dari ${i.stok} tersedia"><i style="width:${i.stok ? i.tersedia / i.stok * 100 : 0}%"></i></div><small>${i.tersedia} tersedia</small></td>
    <td>${status(i)}</td>${isAdmin() ? `<td class="act"><button class="btn s" onclick="itemForm(${i.id})">Ubah</button><button class="btn s d" onclick="delItem(${i.id})">Hapus</button></td>` : ''}</tr>`).join('');
}
function itemForm(id) {
  if (!isAdmin()) return;
  const it = id ? item(id) : { kode: '', nama: '', kategori: '', stok: 1 };
  modal(id ? 'Ubah barang' : 'Tambah barang', `
    <div class="grid2"><label>Kode<input name="kode" value="${esc(it.kode)}" required maxlength="12"></label>
    <label>Stok total<input name="stok" type="number" min="0" value="${it.stok}" required></label></div>
    <label>Nama barang<input name="nama" value="${esc(it.nama)}" required maxlength="60"></label>
    <label>Kategori<input name="kategori" value="${esc(it.kategori)}" required maxlength="30" list="kat">
    <datalist id="kat">${[...new Set(DB.items.map(i => i.kategori))].map(k => `<option value="${esc(k)}">`).join('')}</datalist></label>`,
  async d => {
    const stok = parseInt(d.stok, 10);
    if (!(stok >= 0)) return 'Stok harus berupa angka 0 atau lebih.';
    await rpc('item_save', { p_token: token, p_id: id || null, p_kode: d.kode.trim().toUpperCase(), p_nama: d.nama.trim(), p_kategori: d.kategori.trim(), p_stok: stok });
    await reload(); toast(id ? 'Barang diperbarui' : 'Barang ditambahkan');
  });
}

function delItem(id) {
  if (!isAdmin()) return;
  const it = item(id);
  if (DB.tx.some(t => t.itemId === id && t.status === 'Dipinjam'))
    return toast('Barang masih dipinjam. Selesaikan pengembaliannya dulu.');
  modal('Hapus barang', `<p>Hapus <b>${esc(it.nama)}</b> (${esc(it.kode)})? Tindakan ini tidak bisa dibatalkan.</p>`, async () => {
    await rpc('item_delete', { p_token: token, p_id: id }); await reload(); toast('Barang dihapus');
  }, 'Hapus');
}

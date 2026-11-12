async function doBorrow(e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target)), qty = parseInt(f.qty, 10);
  const fail = m => { $('#ferr').innerHTML = `<div class="err">${esc(m)}</div>`; };
  if (!f.itemId) return fail('Pilih barang yang akan dipinjam.');
  if (!(qty >= 1)) return fail('Jumlah minimal 1.');
  const btn = e.target.querySelector('.btn.p'); btn.disabled = true;
  try {
    await rpc('borrow_create', { p_token: token, p_peminjam: f.peminjam.trim(), p_item_id: parseInt(f.itemId, 10), p_qty: qty, p_tgl: f.tgl, p_catatan: f.catatan.trim() });
    await reload(); toast('Peminjaman disimpan');
  } catch (err) { fail(err.message); btn.disabled = false; }
}
function returnTx(id) {
  const t = DB.tx.find(x => x.id === id);
  modal('Proses pengembalian', `<p><b>${esc(t.peminjam)}</b> mengembalikan ${t.qty} ${esc(t.itemNama)}.</p>
    <label>Tanggal pengembalian<input name="tgl" type="date" value="${today()}" min="${t.tglPinjam}" required></label>`, async d => {
    if (d.tgl < t.tglPinjam) return 'Tanggal pengembalian tidak boleh sebelum tanggal peminjaman.';
    await rpc('borrow_return', { p_token: token, p_tx_id: id, p_tgl: d.tgl });
    await reload(); toast('Barang dikembalikan, stok diperbarui');
  }, 'Kembalikan');
}
function txRows(q, st) {
  q = q.toLowerCase();
  const list = myTx().filter(t => (!st || t.status === st) && (t.peminjam.toLowerCase().includes(q) || (t.itemNama || '').toLowerCase().includes(q))).sort((a, b) => b.id - a.id);
  if (!list.length) return `<tr><td colspan="7" class="empty">Belum ada transaksi yang cocok.</td></tr>`;
  return list.map(t => `<tr><td>${esc(t.peminjam)}</td><td>${esc(t.itemNama)}</td><td class="num">${t.qty}</td><td>${fmt(t.tglPinjam)}</td><td>${fmt(t.tglKembali)}</td><td>${txTag(t)}</td>${isAdmin() ? `<td>${esc(t.oleh)}</td>` : ''}</tr>`).join('');
}
const filterTx = () => $('#trows').innerHTML = txRows($('#hq').value, $('#hs').value);


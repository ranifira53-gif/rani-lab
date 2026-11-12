/* ===== Pengguna (Admin) ===== */
function userForm(id) {
  if (!isAdmin()) return;
  const u = id ? DB.users.find(x => x.id === id) : { nama: '', username: '' };
  modal(id ? 'Ubah Staff' : 'Tambah Staff', `
    <label>Nama lengkap<input name="nama" value="${esc(u.nama)}" required maxlength="60"></label>
    <label>Username<input name="username" value="${esc(u.username)}" required maxlength="20" pattern="[A-Za-z0-9_]{3,20}" title="3-20 karakter: huruf, angka, dan garis bawah"></label>
    <label>Password${id ? ' baru (kosongkan jika tidak diubah)' : ''}<input name="password" type="password" ${id ? '' : 'required'} minlength="6"></label>`, async d => {
    await rpc('user_save', { p_token: token, p_id: id || null, p_nama: d.nama.trim(), p_username: d.username.trim(), p_password: d.password || null });
    await reload(); toast(id ? 'Data Staff diperbarui' : 'Akun Staff dibuat');
  });
}
async function toggleUser(id) {
  if (!isAdmin()) return;
  try {
    await rpc('user_toggle', { p_token: token, p_id: id });
    await reload(); const u = DB.users.find(x => x.id === id); toast(u.aktif ? 'Akun diaktifkan' : 'Akun dinonaktifkan');
  } catch (err) { toast(err.message); }
}

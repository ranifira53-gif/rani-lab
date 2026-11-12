# LabInventory - Laboratory Inventory & Borrowing Management System

Aplikasi web full-stack: frontend HTML/CSS/JavaScript murni + backend Supabase (PostgreSQL).
Tanpa build, tanpa server sendiri. Login, role, dan penyimpanan data berjalan online.

## Teknologi
HTML, CSS, JavaScript (vanilla), Supabase (PostgreSQL + fungsi SQL), hosting Vercel/Netlify.

## Langkah pemasangan
1. Buat akun dan proyek di https://supabase.com (gratis).
2. Buka **SQL Editor > New query**, tempel seluruh isi `supabase/schema.sql`, klik **Run**.
   Ini membuat tabel, data awal (16 barang, akun demo, 4 transaksi contoh), dan semua fungsi.
3. Buka **Project Settings > API**, salin **Project URL** dan **anon key** ke `js/config.js`.
4. Upload folder ini ke GitHub, lalu hubungkan repository ke Vercel atau Netlify
   (tanpa build command, folder output = root).
5. Buka URL hasil hosting dan login dengan akun demo.

## Akun demo
| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin123 |
| Staff | staff    | staff123 |

Akun `staff2` sengaja dibuat nonaktif untuk menguji fitur aktif/nonaktif.
Ganti password demo setelah penilaian selesai.

## Struktur
- `index.html` login, `admin.html` halaman Admin, `staff.html` halaman Staff
- `css/style.css` tampilan
- `js/config.js` URL dan key Supabase (WAJIB diisi)
- `js/data.js` koneksi ke backend (fungsi `rpc`, `refresh`)
- `js/ui.js`, `js/auth.js`, `js/views.js`, `js/barang.js`, `js/transaksi.js`, `js/pengguna.js`, `js/app.js`
- `supabase/schema.sql` seluruh backend: tabel, data awal, fungsi, hak akses

## Keamanan
- Tabel dikunci (RLS aktif, hak akses langsung dicabut). Browser hanya bisa memanggil fungsi yang ada di `schema.sql`.
- Setiap fungsi memeriksa token sesi dan role di server. Staff tidak bisa menghapus barang atau mengelola akun,
  walaupun memanggil API langsung.
- Password disimpan sebagai hash bcrypt. Sesi berlaku 7 hari dan dihapus saat logout atau akun dinonaktifkan.
- Peminjaman dan pengembalian memakai penguncian baris, jadi stok tidak bisa minus saat dua petugas bekerja bersamaan.

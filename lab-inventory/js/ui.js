const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const fmt = s => s ? new Date(s + 'T00:00').toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '-';
const item = id => DB.items.find(i => i.id === id);
const isAdmin = () => me && me.role === 'admin';
const nextId = arr => arr.reduce((m, x) => Math.max(m, x.id), 0) + 1;

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.style.display = 'block';
  clearTimeout(toast.t); toast.t = setTimeout(() => t.style.display = 'none', 2600);
}
function modal(title, body, onSubmit, okLabel = 'Simpan') {
  const m = $('#modal');
  m.innerHTML = `<form class="dlg"><h2>${esc(title)}</h2><div id="merr"></div>${body}
    <div class="row"><button type="button" class="btn" onclick="closeModal()">Batal</button>
    <button class="btn p">${esc(okLabel)}</button></div></form>`;
  m.classList.add('on');
  m.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn.p'), show = x => { $('#merr').innerHTML = `<div class="err">${esc(x)}</div>`; btn.disabled = false; };
    btn.disabled = true;
    try {
      const err = await onSubmit(Object.fromEntries(new FormData(e.target)));
      if (err) show(err); else closeModal();
    } catch (x) { show(x.message); }
  };
  const f = m.querySelector('input,select'); if (f) f.focus();
}
const closeModal = () => $('#modal').classList.remove('on');
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ===== core.js ===== */
const uid = () => 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmt = n => '$' + Math.round(+n || 0).toLocaleString('es-CL');
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
const diasHasta = iso => { if (!iso) return null; const d = new Date(iso + 'T00:00:00'); return Math.round((d - hoy) / 864e5); };
const fdate = iso => { if (!iso) return '—'; const p = iso.split('-'); return p[2] + '-' + p[1] + '-' + p[0]; };
const mesActual = () => { const n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0'); };
const MESES_N = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const mesLabel = m => { const p = m.split('-'); return MESES_N[parseInt(p[1]) - 1] + ' ' + p[0]; };

function save() {
  db.updatedAt = Date.now();
  persist();
}

let modalCallback = null;
function showModal(title, fields, values, onSubmit) {
  const root = $('#modal');
  const rows = fields.map(f => {
    const v = values[f.n] ?? '';
    let ctl;
    if (f.type === 'select') {
      ctl = '<select name="' + f.n + '">' + f.opts.map(op => '<option ' + (String(op) === String(v) ? 'selected' : '') + '>' + esc(op) + '</option>').join('') + '</select>';
    } else if (f.type === 'checkbox') {
      ctl = '<input type="checkbox" name="' + f.n + '" ' + (v ? 'checked' : '') + ' style="width:auto;margin-top:8px">';
    } else {
      ctl = '<input name="' + f.n + '" type="' + (f.type || 'text') + '" value="' + esc(v) + '" ' + (f.req ? 'required' : '') + ' placeholder="' + esc(f.ph || '') + '">';
    }
    return '<label>' + esc(f.l) + ctl + '</label>';
  }).join('');
  root.innerHTML = '<div class="back" onclick="if(event.target===this)closeModal()"><div class="box"><h3>' + esc(title) + '</h3><form>' + rows + '<div class="acts2"><button type="button" class="btn" onclick="closeModal()">Cancelar</button><button type="button" class="btn primary" id="msave">Guardar</button></div></form></div></div>';
  modalCallback = onSubmit;
  $('#msave').onclick = () => {
    const form = root.querySelector('form');
    if (!form.reportValidity()) return;
    const data = {};
    fields.forEach(f => {
      const el = form.querySelector('[name="' + f.n + '"]');
      data[f.n] = f.type === 'checkbox' ? el.checked : (f.type === 'number' ? (parseFloat(el.value) || 0) : el.value.trim());
    });
    if (modalCallback) modalCallback(data);
    closeModal();
    if (typeof render === 'function') render();
  };
}
function closeModal() { $('#modal').innerHTML = ''; }

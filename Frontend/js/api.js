const BASE_URL = 'http://localhost:3000/api';

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const API = {
  async request(method, endpoint, body = null) {
    const token = localStorage.getItem('token');
    
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(BASE_URL + endpoint, options);
    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

    if (!res.ok) {
      const msg = data.mensaje || data.error || data.message || 'Error en la petición';
      throw new Error(msg);
    }
    return data;
  },
  get:    (endpoint)       => API.request('GET',    endpoint),
  post:   (endpoint, body) => API.request('POST',   endpoint, body),
  put:    (endpoint, body) => API.request('PUT',    endpoint, body),
  delete: (endpoint)       => API.request('DELETE', endpoint),
};

function mostrarMensaje(el, texto, tipo = 'ok') {
  if (!el) return;
  el.textContent = texto;
  el.className = 'mensaje ' + tipo;
  setTimeout(() => { el.className = 'mensaje'; el.textContent = ''; }, 4000);
}

function formatearFecha(f) {
  if (!f) return '—';
  const d = new Date(f);
  if (isNaN(d)) return f;
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
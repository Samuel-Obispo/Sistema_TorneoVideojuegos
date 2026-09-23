const formPun     = document.getElementById('formPuntuacion');
const msgPun      = document.getElementById('msgPuntuacion');
const selJug      = document.getElementById('jugador');
const selJue      = document.getElementById('videojuego');
const tbodyPun    = document.querySelector('#tablaPuntuaciones tbody');
const contador    = document.getElementById('contadorPuntuaciones');
const inputBuscar = document.getElementById('buscarPuntuacion');

let cacheJugadores = [];
let cacheJuegos    = [];
let cachePuntajes  = [];

let mapJug = {};
let mapJue = {};

function renderTabla(lista) {
  if (!lista.length) {
    tbodyPun.innerHTML = `<tr><td colspan="5" class="table-empty">Sin coincidencias</td></tr>`;
    return;
  }
  tbodyPun.innerHTML = lista.map(p => {
    const id = p.id_puntuacion ?? p.id;
    const gamertag = p.gamertag_jugador || p.nombre_jugador || mapJug[p.id_jugador] || `#${p.id_jugador}`;
    const juego    = p.nombre_videojuego || p.juego || mapJue[p.id_videojuego] || `#${p.id_videojuego}`;
    return `
      <tr>
        <td>${escapeHTML(gamertag)}</td>
        <td>${escapeHTML(juego)}</td>
        <td><span class="puntos-badge">${p.puntuacion}</span></td>
        <td>${formatearFecha(p.fecha)}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="editarPuntuacion(${id}, ${p.puntuacion})">Editar</button>
          <button class="btn-sm btn-delete" onclick="eliminarPuntuacion(${id})">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

function aplicarBusqueda() {
  const q = (inputBuscar?.value || '').trim().toLowerCase();
  if (!q) { 
    renderTabla(cachePuntajes); 
    return; 
  }
  const filtrados = cachePuntajes.filter(p => {
    const gamertag = (p.gamertag_jugador || p.nombre_jugador || mapJug[p.id_jugador] || '').toLowerCase();
    const juego    = (p.nombre_videojuego || mapJue[p.id_videojuego] || '').toLowerCase();
    
    return gamertag.includes(q) || juego.includes(q);
  });

  renderTabla(filtrados);
}

async function cargarSelects() {
  try {
    const [jugadores, juegos] = await Promise.all([
      API.get('/jugadores'),
      API.get('/videojuegos')
    ]);

    cacheJugadores = Array.isArray(jugadores) ? jugadores : [];
    cacheJuegos    = Array.isArray(juegos)    ? juegos    : [];

    mapJug = Object.fromEntries(cacheJugadores.map(j => [j.id_jugador ?? j.id, j.gamertag]));
    mapJue = Object.fromEntries(cacheJuegos.map(v => [v.id_videojuego ?? v.id, v.nombre]));

    selJug.innerHTML = '<option value="">Selecciona un jugador</option>' +
      cacheJugadores.map(j =>
        `<option value="${j.id_jugador ?? j.id}">${j.gamertag} — ${j.nombre}</option>`
      ).join('');

    selJue.innerHTML = '<option value="">Selecciona un videojuego</option>' +
      cacheJuegos.map(v =>
        `<option value="${v.id_videojuego ?? v.id}">${v.nombre} (${v.genero})</option>`
      ).join('');
  } catch (e) {
    console.error(e);
    selJug.innerHTML = '<option value="">Error al cargar</option>';
    selJue.innerHTML = '<option value="">Error al cargar</option>';
  }
}

async function cargarPuntuaciones() {
  tbodyPun.innerHTML = `<tr><td colspan="5" class="table-empty">Cargando...</td></tr>`;
  try {
    const lista = await API.get('/puntuaciones');
    cachePuntajes = Array.isArray(lista) ? lista : [];

    if (!cachePuntajes.length) {
      tbodyPun.innerHTML = `<tr><td colspan="5" class="table-empty">Sin puntuaciones registradas</td></tr>`;
      contador.textContent = '0 registradas';
      return;
    }

    contador.textContent = `${cachePuntajes.length} registrada${cachePuntajes.length !== 1 ? 's' : ''}`;
    aplicarBusqueda();
  } catch (e) {
    console.error(e);
    tbodyPun.innerHTML = `<tr><td colspan="5" class="table-empty">Error: ${e.message}</td></tr>`;
    contador.textContent = 'Error';
  }
}

// 1. CREAR (POST)
formPun?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const puntos = Number(document.getElementById('puntos').value);
  const idJug  = Number(selJug.value);
  const idJue  = Number(selJue.value);

  if (!idJug || !idJue) {
    mostrarMensaje(msgPun, 'Debes seleccionar jugador y videojuego', 'error');
    return;
  }
  if (isNaN(puntos) || puntos < 0) {
    mostrarMensaje(msgPun, 'La puntuación no puede ser negativa', 'error');
    return;
  }

  const payload = { id_jugador: idJug, id_videojuego: idJue, puntuacion: puntos };

  try {
    await API.post('/puntuaciones', payload);
    mostrarMensaje(msgPun, 'Puntuación registrada con éxito', 'ok');
    formPun.reset();
    cargarPuntuaciones();
  } catch (err) {
    mostrarMensaje(msgPun, err.message, 'error');
  }
});

// 2. ACTUALIZAR (PUT)
async function editarPuntuacion(id, puntosActuales) {
  const nuevaPuntuacion = prompt('Nueva puntuación:', puntosActuales);
  if (nuevaPuntuacion === null) return;

  const puntosNum = Number(nuevaPuntuacion);
  if (isNaN(puntosNum) || puntosNum < 0) {
    alert('Ingresa una puntuación válida no negativa.');
    return;
  }

  try {
    await API.put(`/puntuaciones/${id}`, { puntuacion: puntosNum });
    alert('Puntuación actualizada correctamente');
    cargarPuntuaciones();
  } catch (err) {
    alert(err.message || 'Error al actualizar la puntuación');
  }
}

// 3. ELIMINAR (DELETE)
async function eliminarPuntuacion(id) {
  if (!confirm('¿Estás seguro de eliminar esta puntuación?')) return;

  try {
    await API.delete(`/puntuaciones/${id}`);
    alert('Puntuación eliminada correctamente');
    cargarPuntuaciones();
  } catch (err) {
    alert(err.message || 'Error al eliminar la puntuación');
  }
}

inputBuscar?.addEventListener('input', aplicarBusqueda);
document.addEventListener('tab:ver', () => {
  if (document.querySelector('[data-panel="ver"].active')) cargarPuntuaciones();
});

(async () => {
  await cargarSelects();
  await cargarPuntuaciones();
})();
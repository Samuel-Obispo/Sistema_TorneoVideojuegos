
const formJugador = document.getElementById('formJugador');
const msgJugador  = document.getElementById('msgJugador');
const tbodyJug    = document.querySelector('#tablaJugadores tbody');
const contador    = document.getElementById('contadorJugadores');
const inputBuscar = document.getElementById('buscarJugador');

let cacheJugadores = [];

function renderTabla(lista) {
  if (!lista.length) {
    tbodyJug.innerHTML = `<tr><td colspan="4" class="table-empty">Sin coincidencias</td></tr>`;
    return;
  }
  tbodyJug.innerHTML = lista.map(j => `
    <tr>
      <td>${j.gamertag}</td>
      <td>${j.nombre}</td>
      <td>${j.correo}</td>
      <td>${formatearFecha(j.fecha_registro)}</td>
    </tr>
  `).join('');
}

function aplicarBusqueda() {
  const q = (inputBuscar?.value || '').trim().toLowerCase();
  if (!q) { renderTabla(cacheJugadores); return; }
  const filtrados = cacheJugadores.filter(j =>
    (j.nombre   || '').toLowerCase().includes(q) ||
    (j.gamertag || '').toLowerCase().includes(q)
  );
  renderTabla(filtrados);
}

async function cargarJugadores() {
  tbodyJug.innerHTML = `<tr><td colspan="4" class="table-empty">Cargando...</td></tr>`;
  try {
    const jugadores = await API.get('/jugadores');
    cacheJugadores = Array.isArray(jugadores) ? jugadores : [];

    if (!cacheJugadores.length) {
      tbodyJug.innerHTML = `<tr><td colspan="4" class="table-empty">No hay jugadores registrados</td></tr>`;
      contador.textContent = '0 registrados';
      return;
    }

    contador.textContent = `${cacheJugadores.length} registrado${cacheJugadores.length !== 1 ? 's' : ''}`;
    aplicarBusqueda();
  } catch (e) {
    console.error(e);
    tbodyJug.innerHTML = `<tr><td colspan="4" class="table-empty">Error: ${e.message}</td></tr>`;
    contador.textContent = 'Error';
  }
}

formJugador?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    nombre:   document.getElementById('nombre').value.trim(),
    gamertag: document.getElementById('gamertag').value.trim(),
    correo:   document.getElementById('correo').value.trim(),
  };

  if (!payload.nombre || !payload.gamertag || !payload.correo) {
    mostrarMensaje(msgJugador, 'Todos los campos son obligatorios', 'error');
    return;
  }

  try {
    await API.post('/jugadores', payload);
    mostrarMensaje(msgJugador, 'Jugador registrado con éxito', 'ok');
    formJugador.reset();
    cargarJugadores();
  } catch (err) {
    mostrarMensaje(msgJugador, err.message, 'error');
  }
});

inputBuscar?.addEventListener('input', aplicarBusqueda);
document.addEventListener('tab:ver', () => {
  if (document.querySelector('[data-panel="ver"].active')) cargarJugadores();
});

cargarJugadores();
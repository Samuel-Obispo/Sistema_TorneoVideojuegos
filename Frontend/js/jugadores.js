const formJugador = document.getElementById('formJugador');
const msgJugador  = document.getElementById('msgJugador');
const tbodyJug    = document.querySelector('#tablaJugadores tbody');
const contador    = document.getElementById('contadorJugadores');
const inputBuscar = document.getElementById('buscarJugador');

let cacheJugadores = [];

function renderTabla(lista) {
  if (!lista.length) {
    tbodyJug.innerHTML = `<tr><td colspan="5" class="table-empty">Sin coincidencias</td></tr>`;
    return;
  }
  tbodyJug.innerHTML = lista.map(j => {
    const id = j.id_jugador ?? j.id;
    return `
      <tr>
        <td>${escapeHTML(j.gamertag)}</td>
        <td>${escapeHTML(j.nombre)}</td>
        <td>${escapeHTML(j.correo)}</td>
        <td>${formatearFecha(j.fecha_registro)}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="editarJugador(${id}, '${escapeHTML(j.gamertag)}', '${escapeHTML(j.nombre)}', '${escapeHTML(j.correo)}')">Editar</button>
          <button class="btn-sm btn-delete" onclick="eliminarJugador(${id})">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
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
  tbodyJug.innerHTML = `<tr><td colspan="5" class="table-empty">Cargando...</td></tr>`;
  try {
    const jugadores = await API.get('/jugadores');
    cacheJugadores = Array.isArray(jugadores) ? jugadores : [];

    if (!cacheJugadores.length) {
      tbodyJug.innerHTML = `<tr><td colspan="5" class="table-empty">No hay jugadores registrados</td></tr>`;
      contador.textContent = '0 registrados';
      return;
    }

    contador.textContent = `${cacheJugadores.length} registrado${cacheJugadores.length !== 1 ? 's' : ''}`;
    aplicarBusqueda();
  } catch (e) {
    console.error(e);
    tbodyJug.innerHTML = `<tr><td colspan="5" class="table-empty">Error: ${e.message}</td></tr>`;
    contador.textContent = 'Error';
  }
}

// 1. CREAR (POST)
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

// 2. ACTUALIZAR (PUT)
async function editarJugador(id, gamertagActual, nombreActual, correoActual) {
  const nuevoGamertag = prompt('Nuevo Gamertag:', gamertagActual);
  if (nuevoGamertag === null) return;

  const nuevoNombre = prompt('Nuevo Nombre:', nombreActual);
  if (nuevoNombre === null) return;

  const nuevoCorreo = prompt('Nuevo Correo:', correoActual);
  if (nuevoCorreo === null) return;

  if (!nuevoGamertag.trim() || !nuevoNombre.trim() || !nuevoCorreo.trim()) {
    alert('Todos los campos son obligatorios.');
    return;
  }

  try {
    await API.put(`/jugadores/${id}`, {
      gamertag: nuevoGamertag.trim(),
      nombre: nuevoNombre.trim(),
      correo: nuevoCorreo.trim()
    });
    alert('Jugador actualizado correctamente');
    cargarJugadores();
  } catch (err) {
    alert(err.message || 'Error al actualizar el jugador');
  }
}

// 3. ELIMINAR (DELETE)
async function eliminarJugador(id) {
  if (!confirm('¿Estás seguro de eliminar este jugador?')) return;

  try {
    await API.delete(`/jugadores/${id}`);
    alert('Jugador eliminado correctamente');
    cargarJugadores();
  } catch (err) {
    alert(err.message || 'Error al eliminar el jugador');
  }
}

inputBuscar?.addEventListener('input', aplicarBusqueda);
document.addEventListener('tab:ver', () => {
  if (document.querySelector('[data-panel="ver"].active')) cargarJugadores();
});

cargarJugadores();
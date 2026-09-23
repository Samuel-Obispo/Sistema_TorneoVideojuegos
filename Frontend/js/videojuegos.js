const formJuego   = document.getElementById('formJuego');
const msgJuego    = document.getElementById('msgJuego');
const tbodyJue    = document.querySelector('#tablaJuegos tbody');
const contador    = document.getElementById('contadorJuegos');
const inputBuscar = document.getElementById('buscarJuego');

let cacheJuegos = [];

function renderTabla(lista) {
  if (!lista.length) {
    tbodyJue.innerHTML = `<tr><td colspan="4" class="table-empty">Sin coincidencias</td></tr>`;
    return;
  }
  tbodyJue.innerHTML = lista.map(v => {
    const id = v.id_videojuego ?? v.id;
    return `
      <tr>
        <td>${id}</td>
        <td>${escapeHTML(v.nombre)}</td>
        <td>${escapeHTML(v.genero)}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="editarJuego(${id}, '${escapeHTML(v.nombre)}', '${escapeHTML(v.genero)}')">Editar</button>
          <button class="btn-sm btn-delete" onclick="eliminarJuego(${id})">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

function aplicarBusqueda() {
  const q = (inputBuscar?.value || '').trim().toLowerCase();
  if (!q) { renderTabla(cacheJuegos); return; }
  const filtrados = cacheJuegos.filter(v =>
    (v.nombre || '').toLowerCase().includes(q) ||
    (v.genero || '').toLowerCase().includes(q)
  );
  renderTabla(filtrados);
}

async function cargarJuegos() {
  tbodyJue.innerHTML = `<tr><td colspan="4" class="table-empty">Cargando...</td></tr>`;
  try {
    const juegos = await API.get('/videojuegos');
    cacheJuegos = Array.isArray(juegos) ? juegos : [];

    if (!cacheJuegos.length) {
      tbodyJue.innerHTML = `<tr><td colspan="4" class="table-empty">No hay videojuegos registrados</td></tr>`;
      contador.textContent = '0 registrados';
      return;
    }

    contador.textContent = `${cacheJuegos.length} registrado${cacheJuegos.length !== 1 ? 's' : ''}`;
    aplicarBusqueda();
  } catch (e) {
    console.error(e);
    tbodyJue.innerHTML = `<tr><td colspan="4" class="table-empty">Error: ${e.message}</td></tr>`;
    contador.textContent = 'Error';
  }
}

// 1. CREAR (POST)
formJuego?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    nombre: document.getElementById('nombreJuego').value.trim(),
    genero: document.getElementById('genero').value.trim(),
  };

  if (!payload.nombre || !payload.genero) {
    mostrarMensaje(msgJuego, 'Nombre y género son obligatorios', 'error');
    return;
  }

  try {
    await API.post('/videojuegos', payload);
    mostrarMensaje(msgJuego, 'Videojuego registrado con éxito', 'ok');
    formJuego.reset();
    cargarJuegos();
  } catch (err) {
    mostrarMensaje(msgJuego, err.message, 'error');
  }
});

// 2. ACTUALIZAR (PUT)
async function editarJuego(id, nombreActual, generoActual) {
  const nuevoNombre = prompt('Nuevo nombre del videojuego:', nombreActual);
  if (nuevoNombre === null) return;

  const nuevoGenero = prompt('Nuevo género del videojuego:', generoActual);
  if (nuevoGenero === null) return;

  if (!nuevoNombre.trim() || !nuevoGenero.trim()) {
    alert('El nombre y género no pueden estar vacíos.');
    return;
  }

  try {
    await API.put(`/videojuegos/${id}`, { nombre: nuevoNombre.trim(), genero: nuevoGenero.trim() });
    alert('Videojuego actualizado correctamente');
    cargarJuegos();
  } catch (err) {
    alert(err.message || 'Error al actualizar el videojuego');
  }
}

// 3. ELIMINAR (DELETE)
async function eliminarJuego(id) {
  if (!confirm('¿Estás seguro de eliminar este videojuego?')) return;

  try {
    await API.delete(`/videojuegos/${id}`);
    alert('Videojuego eliminado con éxito');
    cargarJuegos();
  } catch (err) {
    alert(err.message || 'Error al eliminar el videojuego');
  }
}

inputBuscar?.addEventListener('input', aplicarBusqueda);
document.addEventListener('tab:ver', () => {
  if (document.querySelector('[data-panel="ver"].active')) cargarJuegos();
});

cargarJuegos();
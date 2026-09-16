
const formJuego  = document.getElementById('formJuego');
const msgJuego   = document.getElementById('msgJuego');
const tbodyJue   = document.querySelector('#tablaJuegos tbody');
const contador   = document.getElementById('contadorJuegos');
const inputBuscar = document.getElementById('buscarJuego');

let cacheJuegos = [];

function renderTabla(lista) {
  if (!lista.length) {
    tbodyJue.innerHTML = `<tr><td colspan="3" class="table-empty">Sin coincidencias</td></tr>`;
    return;
  }
  tbodyJue.innerHTML = lista.map(v => `
    <tr>
      <td>${v.id_videojuego ?? v.id}</td>
      <td>${v.nombre}</td>
      <td>${v.genero}</td>
    </tr>
  `).join('');
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
  tbodyJue.innerHTML = `<tr><td colspan="3" class="table-empty">Cargando...</td></tr>`;
  try {
    const juegos = await API.get('/videojuegos');
    cacheJuegos = Array.isArray(juegos) ? juegos : [];

    if (!cacheJuegos.length) {
      tbodyJue.innerHTML = `<tr><td colspan="3" class="table-empty">No hay videojuegos registrados</td></tr>`;
      contador.textContent = '0 registrados';
      return;
    }

    contador.textContent = `${cacheJuegos.length} registrado${cacheJuegos.length !== 1 ? 's' : ''}`;
    aplicarBusqueda();
  } catch (e) {
    console.error(e);
    tbodyJue.innerHTML = `<tr><td colspan="3" class="table-empty">Error: ${e.message}</td></tr>`;
    contador.textContent = 'Error';
  }
}

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

inputBuscar?.addEventListener('input', aplicarBusqueda);
document.addEventListener('tab:ver', () => {
  if (document.querySelector('[data-panel="ver"].active')) cargarJuegos();
});

cargarJuegos();
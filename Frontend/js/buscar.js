/* RF07 — Búsqueda por nombre o gamertag */

const formBuscar = document.getElementById('formBuscar');
const input      = document.getElementById('termino');
const resultados = document.getElementById('resultados');
const contador   = document.getElementById('contadorResultados');

let cacheJugadores = [];

async function cargarJugadores() {
  try {
    const data = await API.get('/jugadores');
    cacheJugadores = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    cacheJugadores = [];
  }
}

function renderResultados(lista) {
  if (lista.length === 0) {
    resultados.innerHTML = '<p class="table-empty">No se encontraron coincidencias</p>';
    contador.textContent = 'Sin resultados';
    return;
  }
  contador.textContent = `${lista.length} coincidencia${lista.length !== 1 ? 's' : ''}`;
  resultados.innerHTML = lista.map(j => `
    <div class="resultado-item">
      <div class="resultado-info">
        <span class="gamertag">${j.gamertag}</span>
        <span class="nombre">${j.nombre}</span>
        <span class="correo">${j.correo}</span>
      </div>
      <span class="fecha">Registrado: ${formatearFecha(j.fecha_registro)}</span>
    </div>
  `).join('');
}

async function buscar() {
  const q = input.value.trim();
  if (!q) {
    resultados.innerHTML = '<p class="table-empty">Realiza una búsqueda para ver resultados</p>';
    contador.textContent = 'Esperando búsqueda';
    return;
  }

  try {
    const filtrados = await API.get(`/jugadores/buscar_jugador?q=${encodeURIComponent(q)}`);
    renderResultados(filtrados);
  } catch (e) {
    console.error(e);
    resultados.innerHTML = `<p class="table-empty">Error al buscar: ${e.message}</p>`;
  }
}

formBuscar.addEventListener('submit', (e) => { e.preventDefault(); buscar(); });
input.addEventListener('input', buscar);

cargarJugadores();
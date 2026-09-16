
const tbodyRank = document.querySelector('#tablaRanking tbody');
const filtro    = document.getElementById('filtroJuego');
const btnRef    = document.getElementById('btnRefrescar');

let cacheJugadores = [];
let cacheJuegos    = [];
let cachePuntajes  = [];

async function cargarDatosBase() {
  const [jugadores, juegos, puntuaciones] = await Promise.all([
    API.get('/jugadores'),
    API.get('/videojuegos'),
    API.get('/puntuaciones')
  ]);
  cacheJugadores = Array.isArray(jugadores) ? jugadores : [];
  cacheJuegos    = Array.isArray(juegos)    ? juegos    : [];
  cachePuntajes  = Array.isArray(puntuaciones) ? puntuaciones : [];
}

function cargarFiltroJuegos() {
  filtro.innerHTML = '<option value="">Todos los videojuegos</option>' +
    cacheJuegos.map(v =>
      `<option value="${v.id_videojuego ?? v.id}">${v.nombre}</option>`
    ).join('');
}

async function refrescar() {
  tbodyRank.innerHTML = `<tr><td colspan="4" class="table-empty">Cargando...</td></tr>`;
  try {
    const rankingData = await API.get('/ranking');
    renderRanking(rankingData);
  } catch (e) {
    console.error(e);
    tbodyRank.innerHTML = `<tr><td colspan="4" class="table-empty">Error: ${e.message}</td></tr>`;
  }
}

function renderRanking(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    tbodyRank.innerHTML = `<tr><td colspan="4" class="table-empty">Sin puntuaciones registradas</td></tr>`;
    return;
  }

  tbodyRank.innerHTML = lista.map((row) => {
    const clase = row.posicion <= 3 ? `pos-${row.posicion}` : '';
    return `
      <tr>
        <td class="${clase}">#${row.posicion}</td>
        <td>${row.jugador}</td>
        <td>${row.videojuego}</td>
        <td><span class="puntos-badge">${row.puntuacion}</span></td>
      </tr>
    `;
  }).join('');
}


filtro.addEventListener('change', renderRanking);
btnRef.addEventListener('click', refrescar);

refrescar();
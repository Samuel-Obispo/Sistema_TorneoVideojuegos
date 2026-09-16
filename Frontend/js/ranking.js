
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

function renderRanking() {
  const mapJug = Object.fromEntries(cacheJugadores.map(j => [j.id_jugador ?? j.id, j.gamertag]));
  const mapJue = Object.fromEntries(cacheJuegos.map(v    => [v.id_videojuego ?? v.id, v.nombre]));

  let lista = [...cachePuntajes];

  if (filtro.value) {
    lista = lista.filter(p => String(p.id_videojuego) === String(filtro.value));
  }

  lista.sort((a, b) => Number(b.puntuacion) - Number(a.puntuacion));

  if (lista.length === 0) {
    tbodyRank.innerHTML = `<tr><td colspan="4" class="table-empty">Sin puntuaciones registradas</td></tr>`;
    return;
  }

  tbodyRank.innerHTML = lista.map((p, i) => {
    const pos      = i + 1;
    const clase    = pos <= 3 ? `pos-${pos}` : '';
    const gamertag = p.gamertag   || p.jugador || mapJug[p.id_jugador]    || `#${p.id_jugador}`;
    const juego    = p.videojuego || p.juego   || mapJue[p.id_videojuego] || `#${p.id_videojuego}`;
    return `
      <tr>
        <td class="${clase}">#${pos}</td>
        <td>${gamertag}</td>
        <td>${juego}</td>
        <td><span class="puntos-badge">${p.puntuacion}</span></td>
      </tr>
    `;
  }).join('');
}

async function refrescar() {
  tbodyRank.innerHTML = `<tr><td colspan="4" class="table-empty">Cargando...</td></tr>`;
  try {
    await cargarDatosBase();
    cargarFiltroJuegos();
    renderRanking();
  } catch (e) {
    console.error(e);
    tbodyRank.innerHTML = `<tr><td colspan="4" class="table-empty">Error: ${e.message}</td></tr>`;
  }
}

filtro.addEventListener('change', renderRanking);
btnRef.addEventListener('click', refrescar);

refrescar();
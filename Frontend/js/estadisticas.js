
const btnRef = document.getElementById('btnRefrescar');

async function cargarEstadisticas() {
  try {
    const [jugadores, juegos, puntuaciones] = await Promise.all([
      API.get('/jugadores'),
      API.get('/videojuegos'),
      API.get('/puntuaciones')
    ]);

    const totalJug = Array.isArray(jugadores)    ? jugadores.length    : 0;
    const totalJue = Array.isArray(juegos)       ? juegos.length       : 0;
    const lista    = Array.isArray(puntuaciones) ? puntuaciones        : [];
    const totalPun = lista.length;

    const suma = lista.reduce((a, p) => a + Number(p.puntuacion || 0), 0);
    const prom = totalPun > 0 ? (suma / totalPun) : 0;

    document.getElementById('totalJugadores').textContent    = totalJug;
    document.getElementById('totalJuegos').textContent       = totalJue;
    document.getElementById('totalPuntuaciones').textContent = totalPun;
    document.getElementById('promedio').textContent          = prom.toFixed(2);
  } catch (e) {
    console.error(e);
    document.getElementById('totalJugadores').textContent    = '—';
    document.getElementById('totalJuegos').textContent       = '—';
    document.getElementById('totalPuntuaciones').textContent = '—';
    document.getElementById('promedio').textContent          = '—';
  }
}

btnRef.addEventListener('click', cargarEstadisticas);
cargarEstadisticas();
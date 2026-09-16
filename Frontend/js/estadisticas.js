const btnRef = document.getElementById('btnRefrescar');

async function cargarEstadisticas() {
  try {
    const data = await API.get('/estadisticas');

    document.getElementById('totalJugadores').textContent    = data.total_jugadores ?? 0;
    document.getElementById('totalJuegos').textContent       = data.total_videojuegos ?? 0;
    document.getElementById('totalPuntuaciones').textContent = data.total_puntuaciones ?? 0;
    document.getElementById('promedio').textContent          = Number(data.puntuacion_promedio ?? 0).toFixed(2);
  } catch (e) {
    console.error(e);
    document.getElementById('totalJugadores').textContent    = '—';
    document.getElementById('totalJuegos').textContent       = '—';
    document.getElementById('totalPuntuaciones').textContent = '—';
    document.getElementById('promedio').textContent          = '—';
  }
}

if (btnRef) {
  btnRef.addEventListener('click', cargarEstadisticas);
}

cargarEstadisticas();
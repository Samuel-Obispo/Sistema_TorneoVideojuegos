const tbodyRank = document.querySelector('#tablaRanking tbody');
const filtro    = document.getElementById('filtroJuego');
const btnRef    = document.getElementById('btnRefrescar');

async function cargarFiltroJuegos() {
  try {
    const juegos = await API.get('/videojuegos');
    const cacheJuegos = Array.isArray(juegos) ? juegos : [];
    filtro.innerHTML = '<option value="">Todos los videojuegos</option>' +
      cacheJuegos.map(v =>
        `<option value="${v.id_videojuego ?? v.id}">${escapeHTML(v.nombre)}</option>`
      ).join('');
  } catch (e) {
    console.error('Error al cargar catálogo de juegos para el filtro:', e);
  }
}

async function refrescar() {
  tbodyRank.innerHTML = `<tr><td colspan="4" class="table-empty">Cargando...</td></tr>`;
  try {
    const idJuego = filtro.value;
    const endpoint = idJuego ? `/ranking?id_videojuego=${idJuego}` : '/ranking';
    const rankingData = await API.get(endpoint);
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
        <td>${escapeHTML(row.jugador)}</td>
        <td>${escapeHTML(row.videojuego)}</td>
        <td><span class="puntos-badge">${row.puntuacion}</span></td>
      </tr>
    `;
  }).join('');
}

filtro.addEventListener('change', refrescar);
btnRef.addEventListener('click', refrescar);

(async () => {
  await cargarFiltroJuegos();
  await refrescar();
})();
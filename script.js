const form = document.querySelector('#tournament-form')
const notice = document.querySelector('#notice')
const tabs = document.querySelectorAll('.form-tab')
const eyebrow = document.querySelector('#form-eyebrow')
const title = document.querySelector('#form-title')
const description = document.querySelector('#form-description')
const note = document.querySelector('.workspace-note')
const requiredNote = document.querySelector('.required-note')


const forms = {
  players: {
    eyebrow: 'Módulo 01', 
    title: 'Registrar jugador', 
    description: 'Crea el perfil de cada competidor para habilitarlo en el torneo.',
    fields: `<div class="field-grid">
  <label class="field">
    <span>Nombre completo <b>*</b></span>
    <input name="fullName" placeholder="Ej. Valentina Gómez" required>
    </label>
  <label class="field">
    <span>Gamertag o alias <b>*</b></span>
    <input name="gamertag" placeholder="Ej. valen.gg" required>
</label>
  <label class="field">
    <span>Correo electrónico <b>*</b></span>
    <input name="email" type="email" placeholder="nombre@correo.com" required>
</label>
  <label class="field">
    <span>Fecha de registro <b>*</b></span>
    <input name="registrationDate" type="date" required>
</label>
  </div>`
  },
  games: {
    eyebrow: 'Módulo 02', 
    title: 'Registrar videojuego', 
    description: 'Agrega los títulos que harán parte de la competencia.',
    fields: `<div class="field-grid">
    <label class="field">
    <span>Nombre del videojuego <b>*</b>
    </span>
    <input name="gameName" placeholder="Ej. Valorant" required></label>
    <label class="field">
    <span>Género <b>*</b></span>
    <select name="genre" required>
    <option value="">Selecciona un género</option>
    <option>Acción</option>
    <option>Arena</option>
    <option>Estrategia</option>
    <option>Batalla</option>
    <option>Carreras</option>
    </select></label></div>`
  },
  scores: {
    eyebrow: 'Módulo 03', 
    title: 'Registrar puntuación', 
    description: 'Guarda el resultado de una partida y mantén el tablero actualizado.',
    fields: `<div class="field-grid">
    <label class="field">
    <span>Jugador <b>*</b></span>
    <select name="scorePlayer" required>
    <option value="">Cargar jugadores desde API</option>
    </select>
    </label>
    <label class="field">
    <span>Videojuego <b>*</b></span>
    <select name="scoreGame" required>
    <option value="">Cargar videojuegos desde API</option>
    </select>
    </label>
    <label class="field">
    <span>Puntuación <b>*</b></span>
    <input name="score" type="number" placeholder="Ej. 100" min="0" required>
    </label>
    <label class="field">
    <span>Fecha de la partida <b>*</b></span>
    <input name="matchDate" type="date" required>
    </label>
    </div>`
  },
  'players-query': {
    eyebrow: 'Módulo 04', 
    title: 'Consultar jugadores', 
    description: 'Busca por nombre o gamertag y consulta los registros provenientes del backend.',
    fields: `<div class="field-grid">
    <label class="field field-wide">
    <span>Buscar jugador</span>
    <input name="search" placeholder="Escribe un nombre o gamertag">
    </label>
    </div>
    <div class="data-placeholder">
    <strong>Tabla de jugadores</strong>
    <span>GAMERTAG · CORREO · FECHA DE REGISTRO</span>
    <small>Aún no hay jugadores registrados en el sistema.</small></div>`
  },
  ranking: {
    eyebrow: 'Módulo 05', 
    title: 'Mostrar clasificación', 
    description: 'Presenta el ranking ordenado de mayor a menor puntuación.',
    fields: `<div class="data-placeholder">
    <strong>Clasificación del torneo</strong>
    <span>POSICIÓN · JUGADOR · VIDEOJUEGO · PUNTUACIÓN</span>
    <small>La clasificación se actualizará en cuanto haya puntuaciones registradas.</small>
    </div>`
  },
  stats: {
    eyebrow: 'Módulo 06', 
    title: 'Estadísticas', 
    description: 'Resume la información almacenada para mostrar el estado del torneo.',
    fields: `<div class="stats-grid">
    <div><strong>—</strong><span>Total jugadores</span></div>
    <div><strong>—</strong><span>Total videojuegos</span></div>
    <div><strong>—</strong><span>Puntuaciones registradas</span></div>
    <div><strong>—</strong><span>Puntuación promedio</span></div>
  </div>`
  }
}

function renderForm(key) {
  const current = forms[key]
  eyebrow.textContent = current.eyebrow
  title.textContent = current.title
  description.textContent = current.description
  const isQuery = ['players-query', 'ranking', 'stats'].includes(key)
  requiredNote.hidden = isQuery
  form.innerHTML = `${current.fields}${isQuery ? '' : '<div class="form-actions"><button class="button button-secondary" type="reset">Limpiar</button><button class="button button-primary" type="submit">Guardar registro <span aria-hidden="true">↗</span></button></div>'}`
  notice.hidden = true
}

tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((item) => { item.classList.remove('is-active'); item.removeAttribute('aria-current') })
  tab.classList.add('is-active'); tab.setAttribute('aria-current', 'page')
  renderForm(tab.dataset.form)
}))

form.addEventListener('submit', (event) => {
  event.preventDefault()
  if (!form.checkValidity()) { form.reportValidity(); return }
  notice.textContent = 'Validación correcta.'
  notice.hidden = false
  // Punto de integración: enviar FormData al endpoint correspondiente con fetch().
})

renderForm('players')

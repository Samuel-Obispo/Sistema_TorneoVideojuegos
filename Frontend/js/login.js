// Alternar entre pestañas Login / Register
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');

tabLogin?.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  formLogin.classList.add('active');
  formRegister.classList.remove('active');
});

tabRegister?.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  formRegister.classList.add('active');
  formLogin.classList.remove('active');
});

// 1. INICIAR SESIÓN (POST /api/auth/login)
formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msgLogin');

  const correo = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  try {
    const res = await API.post('/auth/login', { correo, password });
    localStorage.setItem('token', res.token);
    window.location.href = 'pages/dashboard.html';
  } catch (err) {
    msg.textContent = err.message || 'Error al iniciar sesión';
    msg.style.color = 'red';
  }
});

// 2. REGISTRARSE (POST /api/auth/register)
formRegister?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msgRegister');

  const nombre = document.getElementById('regUsuario').value.trim();
  const correo = document.getElementById('regCorreo').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  try {
    // Envía exactamente las 3 llaves requeridas por auth.js: nombre, correo y password
    await API.post('/auth/register', { nombre, correo, password });
    
    msg.textContent = '¡Cuenta creada! Ya puedes iniciar sesión.';
    msg.style.color = 'green';
    formRegister.reset();

    setTimeout(() => tabLogin.click(), 1200);
  } catch (err) {
    msg.textContent = err.message || 'Error en el registro';
    msg.style.color = 'red';
  }
});
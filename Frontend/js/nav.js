(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  const token = localStorage.getItem('token');

  if (!token && path !== 'index.html' && path !== '') {
    window.location.href = '../index.html';
    return;
  }

  document.querySelectorAll('.mainnav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '../index.html';
    });
  }
})();
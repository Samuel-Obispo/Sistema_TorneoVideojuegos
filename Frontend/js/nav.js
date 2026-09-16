(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.mainnav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });
})();
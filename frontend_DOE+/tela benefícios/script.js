document.addEventListener('DOMContentLoaded', function () {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeMenuBtn = document.getElementById('closeMenu');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');

  function openMenu() {
    sideMenu.classList.add('open');
    overlay.classList.add('active');
    sideMenu.setAttribute('aria-hidden', 'false');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    sideMenu.classList.remove('open');
    overlay.classList.remove('active');
    sideMenu.setAttribute('aria-hidden', 'true');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  hamburgerBtn.addEventListener('click', openMenu);
  closeMenuBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  document.querySelectorAll('.menu-btn').forEach(function (btn, index) {
    btn.addEventListener('click', function () {
      console.log('Botão ' + (index + 1) + ' clicado — defina a ação aqui.');
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = btn.getAttribute('data-tab');

      tabButtons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      tabPanels.forEach(function (panel) {
        panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
      });
    });
  });

  document.querySelectorAll('.btn-activate').forEach(function (btn) {
    btn.addEventListener('click', function () {
      console.log('Ativar benefício clicado — ligar isso na sua lógica/backend.');
    });
  });
});
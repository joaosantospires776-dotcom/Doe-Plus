document.addEventListener('DOMContentLoaded', () => {
  const openMenuBtn = document.getElementById('openMenuBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  const openSidebar = () => {
      sidebar.classList.add('active');
      sidebarOverlay.classList.add('active');
      sidebar.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; 
  };

  const closeSidebar = () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      sidebar.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
  };

  if (openMenuBtn) openMenuBtn.addEventListener('click', openSidebar);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) {
          closeSidebar();
      }
  });
});
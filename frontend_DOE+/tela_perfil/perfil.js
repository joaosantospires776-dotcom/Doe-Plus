const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase() : 'U';
}

function updateAvatar(avatar, profile) {
  const hasPhoto = Boolean(profile.photo);
  avatar.textContent = hasPhoto ? '' : getInitials(profile.name);
  avatar.style.backgroundImage = hasPhoto ? `url("${profile.photo}")` : '';
  avatar.classList.toggle('has-photo', hasPhoto);
  avatar.setAttribute('aria-label', hasPhoto ? `Foto do perfil de ${profile.name || 'usuário'}` : `Perfil de ${profile.name || 'usuário'}`);
  if ('title' in avatar) avatar.title = profile.name || 'Perfil do usuário';
}

function syncProfileAvatars() {
  const profile = window.DoeSession.getProfile() || {};
  document.querySelectorAll('[data-profile-avatar]').forEach((avatar) => updateAvatar(avatar, profile));
  document.querySelectorAll('.user-name').forEach((element) => {
    element.textContent = profile.name || 'Usuário';
  });
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  const splitAt = digits.length > 10 ? 5 : 4;
  return `(${areaCode}) ${number.slice(0, splitAt)}${number.length > splitAt ? `-${number.slice(splitAt)}` : ''}`;
}

function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      image.onload = () => {
        const scale = Math.min(1, 512 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function initializeProfilePage() {
  if (!window.DoeSession.isAuthenticated()) {
    window.location.replace('../tela_acesso/index.html?mode=login');
    return;
  }

  syncProfileAvatars();

  const openMenuButton = document.getElementById('openMenuBtn');
  const closeMenuButton = document.getElementById('closeMenu');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');

  function setMenuOpen(isOpen) {
    if (!sideMenu || !overlay) return;
    sideMenu.classList.toggle('open', isOpen);
    overlay.classList.toggle('active', isOpen);
    sideMenu.setAttribute('aria-hidden', String(!isOpen));
    openMenuButton?.setAttribute('aria-expanded', String(isOpen));
  }

  openMenuButton?.addEventListener('click', () => setMenuOpen(true));
  closeMenuButton?.addEventListener('click', () => setMenuOpen(false));
  overlay?.addEventListener('click', () => setMenuOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  const form = document.getElementById('profileForm');
  if (!form) return;

  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const ageInput = form.querySelector('[name="age"]');
  const cpfInput = document.getElementById('profileCpf');
  const phoneInput = document.getElementById('profilePhone');
  const bloodTypeInput = document.getElementById('profileBloodType');
  const hemocenterInput = document.getElementById('profileHemocenter');
  const emergencyNameInput = document.getElementById('profileEmergencyName');
  const emergencyPhoneInput = document.getElementById('profileEmergencyPhone');
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('profilePreview');
  const removePhotoButton = document.getElementById('removePhoto');
  const status = document.getElementById('formStatus');
  const logoutDialog = document.getElementById('logoutDialog');
  const deleteAccountDialog = document.getElementById('deleteAccountDialog');
  const savedProfile = window.DoeSession.getProfile();
  let photo = '';

  [nameInput, emailInput, ageInput, cpfInput, phoneInput, bloodTypeInput, hemocenterInput, emergencyNameInput, emergencyPhoneInput]
    .forEach((input) => { input.value = savedProfile[input.name] || ''; });
  photo = savedProfile.photo || '';

  function refreshPreview() {
    updateAvatar(photoPreview, { name: nameInput.value, photo });
  }

  refreshPreview();
  nameInput.addEventListener('input', refreshPreview);
  cpfInput.addEventListener('input', () => { cpfInput.value = formatCpf(cpfInput.value); });
  phoneInput.addEventListener('input', () => { phoneInput.value = formatPhone(phoneInput.value); });
  emergencyPhoneInput.addEventListener('input', () => { emergencyPhoneInput.value = formatPhone(emergencyPhoneInput.value); });

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      status.textContent = 'Escolha um arquivo de imagem.';
      status.classList.add('error');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      status.textContent = 'A imagem deve ter no máximo 5 MB.';
      status.classList.add('error');
      return;
    }

    try {
      photo = await resizePhoto(file);
      refreshPreview();
      status.textContent = 'Foto pronta. Salve as alterações para atualizar seu perfil.';
      status.classList.remove('error');
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
    }
  });

  removePhotoButton.addEventListener('click', () => {
    photo = '';
    photoInput.value = '';
    refreshPreview().html
  });

  document.getElementById('deleteAccountBtn').addEventListener('click', () => deleteAccountDialog.showModal());
  document.getElementById('cancelDelete').addEventListener('click', () => deleteAccountDialog.close());
  document.getElementById('confirmDelete').addEventListener('click', () => {
    window.DoeSession.clearAccount();
    window.location.replace('../tela_acesso/index.html?mode=register');
  });
}

document.addEventListener('DOMContentLoaded', initializeProfilePage);
    status.textContent = 'A foto será removida ao salvar as alterações.';
    status.classList.remove('error');
  ;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const profile = Object.fromEntries(new FormData(form).entries());
    profile.photo = photo;
    try {
      window.DoeSession.updateProfile(profile);
      syncProfileAvatars();
      status.textContent = 'Alterações salvas nesta aba.';
      status.classList.remove('error');
    } catch (error) {
      console.error('Não foi possível atualizar o perfil.', error);
      status.textContent = 'Não foi possível salvar as alterações. Tente novamente.';
      status.classList.add('error');
    }
  });

  function openLogoutConfirmation() {
    setMenuOpen(false);
    logoutDialog.showModal();
  }

  document.getElementById('logoutBtn').addEventListener('click', openLogoutConfirmation);
  document.getElementById('logoutFromProfile').addEventListener('click', openLogoutConfirmation);
  document.getElementById('cancelLogout').addEventListener('click', () => logoutDialog.close());
  document.getElementById('confirmLogout').addEventListener('click', () => {
    window.DoeSession.clearAccount();
    window.location.replace('../tela_acesso/index.html');
  });

  document.getElementById('deleteAccountBtn').addEventListener('click', () => deleteAccountDialog.showModal());
  document.getElementById('cancelDelete').addEventListener('click', () => deleteAccountDialog.close());
  document.getElementById('confirmDelete').addEventListener('click', () => {
    window.DoeSession.clearAccount();
    window.location.replace('../tela_acesso/index.html?mode=register');
  });

document.addEventListener('DOMContentLoaded', initializeProfilePage);
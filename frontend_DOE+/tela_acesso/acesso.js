document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splashScreen');
  const accessLayout = document.getElementById('accessLayout');
  const welcomePanel = document.getElementById('welcomePanel');
  const openLoginButton = document.getElementById('openLogin');
  const openRegisterButton = document.getElementById('openRegister');
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const title = document.getElementById('auth-title');
  const description = document.getElementById('auth-description');
  const registerTitle = document.getElementById('register-title');
  const registerDescription = document.querySelector('#registerPanel .auth-heading p');

  function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle('error', isError);
  }

  function switchMode(mode) {
    const isWelcome = mode === 'welcome';
    const isRegister = mode === 'register';
    welcomePanel.hidden = !isWelcome;
    loginPanel.hidden = isWelcome || isRegister;
    registerPanel.hidden = isWelcome || !isRegister;

    if (isRegister) {
      registerTitle.textContent = 'Crie seu perfil';
      registerDescription.textContent = 'Preencha seus dados para começar.';
    } else if (!isWelcome) {
      title.textContent = 'Entre na sua conta';
      description.textContent = 'Acesse seu espaço de doador.';
    }
  }

  openLoginButton.addEventListener('click', () => switchMode('login'));
  openRegisterButton.addEventListener('click', () => switchMode('register'));
  document.querySelectorAll('[data-back-to-welcome]').forEach((button) => {
    button.addEventListener('click', () => switchMode('welcome'));
  });
  document.querySelectorAll('[data-switch-mode]').forEach((button) => {
    button.addEventListener('click', () => switchMode(button.dataset.mode || button.dataset.switchMode));
  });

  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    const input = button.parentElement.querySelector('input');
    button.addEventListener('click', () => {
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      button.setAttribute('aria-label', isVisible ? 'Mostrar senha' : 'Ocultar senha');
      button.setAttribute('aria-pressed', String(!isVisible));
      button.innerHTML = `<i data-lucide="${isVisible ? 'eye' : 'eye-off'}" aria-hidden="true"></i>`;
      window.lucide?.createIcons();
    });
  });

  const requestedMode = new URLSearchParams(window.location.search).get('mode');
  if (requestedMode === 'register' || requestedMode === 'login') {
    switchMode(requestedMode);
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
    const splitAt = digits.length > 10 ? 5 : 4;
    const localNumber = digits.slice(2);
    return `(${digits.slice(0, 2)}) ${localNumber.slice(0, splitAt)}${localNumber.length > splitAt ? `-${localNumber.slice(splitAt)}` : ''}`;
  }

  const cpfInput = document.getElementById('registerCpf');
  const phoneInput = document.getElementById('registerPhone');
  const emergencyPhoneInput = document.getElementById('registerEmergencyPhone');
  cpfInput.addEventListener('input', () => { cpfInput.value = formatCpf(cpfInput.value); });
  phoneInput.addEventListener('input', () => { phoneInput.value = formatPhone(phoneInput.value); });
  emergencyPhoneInput.addEventListener('input', () => { emergencyPhoneInput.value = formatPhone(emergencyPhoneInput.value); });

  function getDestination() {
    const destinations = {
      hemocentros: '../tela_hemoc_próximos/hemocprox.html',
      beneficios: '../tela benefícios/index.html',
      lia: '../tela_chatbot/index.html',
      painel: '../tela_dashboard/index.html'
    };
    const next = new URLSearchParams(window.location.search).get('next');
    return destinations[next] || '../Tela inicial/index.html';
  }


  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const form = event.currentTarget;
    const message = document.getElementById('loginMessage');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
  
    const email = String(formData.get('email')).trim().toLowerCase();
    const senha = String(formData.get('password'));
  
    submitButton.disabled = true;
    showMessage(message, 'Verificando seus dados...');
  
    try {
      const resposta = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });
  
      const resultado = await resposta.json();
  
      if (!resposta.ok) {
        if (resposta.status === 401) {
          throw new Error('E-mail ou senha incorretos.');
        }
  
        throw new Error(resultado.detail || 'Não foi possível realizar o login.');
      }
  
      const doador = resultado.doador;
  
      const perfil = {
        name: doador.nome,
        email: doador.email,
        phone: doador.telefone,
        bloodType: doador.tipo_sanguineo,
        hemocenter: doador.cidade
      };
  
      // Cria a sessão local após a API confirmar o login.
      window.DoeSession.createAccount(perfil);
  
      showMessage(message, 'Login realizado com sucesso!');
      window.location.assign(getDestination());
  
    } catch (error) {
      console.error('Erro no login:', error);
  
      const mensagem = error instanceof TypeError
        ? 'Não foi possível conectar à API. Verifique se ela está rodando.'
        : error.message;
  
      showMessage(message, mensagem, true);
  
    } finally {
      submitButton.disabled = false;
    }
  });
  

  document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = document.getElementById('registerMessage');

    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      showMessage(message, 'As senhas não coincidem.', true);
      document.getElementById('confirmPassword').focus();
      return;
    }

    const profile = {
      name: String(formData.get('name')).trim(),
      email: String(formData.get('email')).trim().toLowerCase(),
      age: String(formData.get('age')),
      bloodType: String(formData.get('bloodType')),
      cpf: String(formData.get('cpf')),
      phone: String(formData.get('phone')).trim(),
      hemocenter: String(formData.get('hemocenter')).trim(),
      emergencyName: String(formData.get('emergencyName')).trim(),
      emergencyPhone: String(formData.get('emergencyPhone')).trim()
    };

    const apiUrl = 'http://127.0.0.1:8000';

    
const doador = {
  nome: profile.name,
  email: profile.email,
  telefone: profile.phone.replace(/\D/g, ''),
  tipo_sanguineo: profile.bloodType,
  cidade: profile.hemocenter,
  disponivel: true,
  senha: String(password)
};


    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    showMessage(message, 'Cadastrando seu perfil...');

    try {
      const resposta = await fetch(`${apiUrl}/doadores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(doador)
      });

      if (!resposta.ok) {
        const detalhe = await resposta.text();
        console.error('Erro da API:', resposta.status, detalhe);

        if (resposta.status === 422) {
          throw new Error('A API rejeitou algum campo do cadastro. Confira os dados enviados.');
        }

        throw new Error(`Não foi possível cadastrar o doador (HTTP ${resposta.status}).`);
      }

      const doadorSalvo = await resposta.json();

      // Só cria a sessão após a confirmação da API.
      window.DoeSession.createAccount(profile);

      showMessage(message, 'Cadastro realizado com sucesso!');

      console.log('Doador cadastrado na API:', doadorSalvo);

      window.location.assign(getDestination());

    } catch (error) {
      console.error('Erro ao cadastrar:', error);

      const mensagem = error instanceof TypeError
        ? 'Não foi possível conectar à API. Verifique se o backend está rodando e se o CORS está configurado.'
        : error.message;

      showMessage(message, mensagem, true);

    } finally {
      submitButton.disabled = false;
    }
  });


  window.setTimeout(() => {
    accessLayout.hidden = false;
    splash.classList.add('is-hidden');
    window.setTimeout(() => { splash.hidden = true; }, 380);
  }, 950);
});
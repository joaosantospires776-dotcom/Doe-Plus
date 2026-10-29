document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. FUNCIONALIDADE DO MENU LATERAL (SIDEBAR)
  // ==========================================================================
  const openMenuBtn = document.getElementById('openMenuBtn');
  const closeMenuBtn = document.getElementById('closeMenu');
  const sidebar = document.getElementById('sideMenu');
  const sidebarOverlay = document.getElementById('overlay');

  function openSidebar() {
    if (sidebar && sidebarOverlay) {
      sidebar.classList.add('active');
      sidebarOverlay.classList.add('active');
      sidebar.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSidebar() {
    if (sidebar && sidebarOverlay) {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      sidebar.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (openMenuBtn) openMenuBtn.addEventListener('click', openSidebar);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // ==========================================================================
  // 2. INTEGRAÇÃO COM A IA REAL (VIA API / FETCH)
  // ==========================================================================
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  // Endereço do seu backend ou webhook da IA (substitua pela sua URL real)
  const API_URL = '/api/chat';

  async function sendMessage(text) {
    if (!text || text.trim() === '') return;

    const cleanText = text.trim();

    // 1. Exibe a mensagem digitada pelo usuário
    appendMessage(cleanText, 'user-message');

    // Limpa o campo de texto
    if (userInput) userInput.value = '';

    // 2. Exibe o balão temporário "LIA está digitando..."
    const typingId = showTypingIndicator();

    try {
      // 3. Chamada real à API do seu backend de IA
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: cleanText })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      // 4. Remove o indicador "digitando..."
      removeTypingIndicator(typingId);

      // 5. Exibe a resposta real vinda do backend (ex: data.reply ou data.response)
      const iaReply = data.reply || data.response || data.message || 'Não recebi uma resposta válida do servidor.';
      appendMessage(iaReply, 'lia-message');

    } catch (error) {
      console.error('Erro ao conectar com a IA:', error);
      removeTypingIndicator(typingId);

      // Mensagem de erro amigável caso ocorra falha no servidor ou na conexão
      appendMessage('Desculpe, estou com dificuldades de conexão no momento. Por favor, tente novamente em instantes.', 'lia-message');
    }
  }

  // Cria o balão de mensagem (usuário ou IA)
  function appendMessage(text, typeClass) {
    if (!chatMessages) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${typeClass}`;

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = String(text);

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = timeStr;

    msgDiv.append(content, time);

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Balão temporário enquanto aguarda a resposta da API
  function showTypingIndicator() {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgDiv = document.createElement('div');
    const tempId = 'typing-' + Date.now();
    msgDiv.id = tempId;
    msgDiv.className = 'message lia-message';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.style.fontStyle = 'italic';
    content.style.opacity = '0.8';
    content.textContent = 'LIA está digitando...';

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = timeStr;

    msgDiv.append(content, time);

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return tempId;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // Envio pelo formulário
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (userInput) {
        sendMessage(userInput.value);
      }
    });
  }

  // Permite que os botões rápidos e chips chamem a função sendMessage
  window.sendSuggested = function(topicText) {
    sendMessage(topicText);
  };
  window.sendQuickTopic = function(topicText) {
    sendMessage(topicText);
  };
});
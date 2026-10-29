const services = {
  hemocentros: {
    title: 'Encontre um lugar para doar',
    description: 'Pesquise hemocentros por cidade, estado ou CEP e consulte endereço, horário e formas de contato.',
    icon: 'map-pin',
    steps: ['Informe sua região', 'Compare as unidades próximas', 'Consulte os detalhes para planejar sua visita']
  },
  beneficios: {
    title: 'Reconheça cada gesto de cuidado',
    description: 'Consulte benefícios para doadores e conheça direitos previstos em lei, com orientações sobre as regras locais.',
    icon: 'gift',
    steps: ['Veja benefícios disponíveis', 'Confira vantagens e direitos', 'Acompanhe o que pode ser ativado no seu perfil']
  },
  lia: {
    title: 'Converse com a LIA',
    description: 'Encontre orientações sobre doação de sangue e tire dúvidas em uma conversa simples e acessível.',
    icon: 'messages-square',
    steps: ['Conte o que você quer saber', 'Receba orientações sobre doação', 'Continue a conversa quando precisar']
  },
  painel: {
    title: 'Acompanhe sua jornada',
    description: 'Reúna seu histórico de doações e acompanhe indicadores da sua trajetória como doador.',
    icon: 'chart-no-axes-column-increasing',
    steps: ['Acesse seu resumo pessoal', 'Consulte seu histórico de doações', 'Veja sua evolução ao longo do tempo']
  }
};

const feature = new URLSearchParams(window.location.search).get('feature');
const service = services[feature];

if (!service) {
  window.location.replace('index.html');
} else {
  document.title = `${service.title} | DOE+`;
  document.querySelector(`[data-feature-link="${feature}"]`)?.classList.add('is-current');
  document.querySelector(`[data-feature-link="${feature}"]`)?.setAttribute('aria-current', 'page');
  document.getElementById('serviceTitle').textContent = service.title;
  document.getElementById('serviceDescription').textContent = service.description;
  document.getElementById('serviceIcon').innerHTML = `<i data-lucide="${service.icon}" aria-hidden="true"></i>`;
  document.getElementById('serviceSteps').innerHTML = service.steps.map((step, index) => `
    <article class="service-step">
      <span class="service-step-number">0${index + 1}</span>
      <h2>${step}</h2>
    </article>
  `).join('');

  const primaryAction = document.getElementById('servicePrimaryAction');
  const loginAction = document.getElementById('serviceLoginAction');
  const accessLinks = document.querySelectorAll('.access-link, .footer a[href="../tela_acesso/index.html"]');
  primaryAction.href = `../tela_acesso/index.html?mode=register&next=${encodeURIComponent(feature)}`;
  loginAction.href = `../tela_acesso/index.html?mode=login&next=${encodeURIComponent(feature)}`;
  accessLinks.forEach((link) => {
    link.href = `../tela_acesso/index.html?mode=login&next=${encodeURIComponent(feature)}`;
  });

  window.lucide?.createIcons();
}
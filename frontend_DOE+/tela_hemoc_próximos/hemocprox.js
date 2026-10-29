const menu = document.querySelector('#sideMenu');
const overlay = document.querySelector('#overlay');
const openMenuButton = document.querySelector('#openMenuBtn');
const closeMenuButton = document.querySelector('#closeMenu');
const locationForm = document.querySelector('#location-form');
const locationInput = document.querySelector('#location-input');
const useLocationButton = document.querySelector('#use-location-btn');
const locationStatus = document.querySelector('#location-status');
const distanceSelect = document.querySelector('#distance-select');
const hemocenterList = document.querySelector('#hemocenter-list');
const resultsSummary = document.querySelector('#results-summary');
const cardTemplate = document.querySelector('#hemocenter-card-template');

// Estes dados locais simulam a resposta da API durante o desenvolvimento.
const sampleHemocenters = [
	{
		id: 'hemocentro-1',
		name: 'Hemocentro 1',
		distance: 4.2,
		address: 'Endereço do Hemocentro 1',
		hours: 'Horário de atendimento do Hemocentro 1',
		phone: 'Telefone do Hemocentro 1',
		detailsUrl: '#',
		routeUrl: '#'
	},
	{
		id: 'hemocentro-2',
		name: 'Hemocentro 2',
		distance: 8.7,
		address: 'Endereço do Hemocentro 2',
		hours: 'Horário de atendimento do Hemocentro 2',
		phone: 'Telefone do Hemocentro 2',
		detailsUrl: '#',
		routeUrl: '#'
	}
];

const hemocentersApiUrl = window.HEMOCENTERS_API_URL || '';
let hemocenters = window.HEMOCENTERS_DATA || sampleHemocenters;

function setMenuState(isOpen) {
	menu.classList.toggle('active', isOpen);
	overlay.classList.toggle('active', isOpen);
	menu.setAttribute('aria-hidden', String(!isOpen));
	openMenuButton.setAttribute('aria-expanded', String(isOpen));
}

function setStatus(message, isError = false) {
	locationStatus.textContent = message;
	locationStatus.classList.toggle('error', isError);
}

function showEmptyState(title, message) {
	hemocenterList.innerHTML = `
		<div class="empty-state">
			<div class="empty-state-icon" aria-hidden="true"><i data-lucide="map-pin"></i></div>
			<h3>${title}</h3>
			<p>${message}</p>
		</div>
	`;
	if (window.lucide) window.lucide.createIcons();
}

function renderHemocenters(hemocentersToShow) {
	hemocenterList.replaceChildren();

	if (!hemocentersToShow.length) {
		showEmptyState('Nenhum hemocentro encontrado', 'Tente aumentar a distância da busca ou verificar a localização informada.');
		resultsSummary.textContent = 'Nenhuma unidade encontrada para este filtro.';
		return;
	}

	const fragment = document.createDocumentFragment();

	hemocentersToShow.forEach((hemocenter, index) => {
		const card = cardTemplate.content.cloneNode(true);
		const article = card.querySelector('.hemocenter-card');
		const detailsLink = card.querySelector('[data-field="details-link"]');
		const routeLink = card.querySelector('[data-field="route-link"]');

		article.dataset.hemocenterId = hemocenter.id || `hemocentro-${index + 1}`;
		card.querySelector('[data-field="name"]').textContent = hemocenter.name || 'Hemocentro disponível';
		card.querySelector('[data-field="distance"]').textContent = hemocenter.distance
			? `${hemocenter.distance.toLocaleString('pt-BR')} km de distância`
			: 'Distância não informada';
		card.querySelector('[data-field="address"]').textContent = hemocenter.address || 'Endereço não informado';
		card.querySelector('[data-field="hours"]').textContent = hemocenter.hours || 'Não informado';
		card.querySelector('[data-field="phone"]').textContent = hemocenter.phone || 'Não informado';
		detailsLink.href = hemocenter.detailsUrl || '#';
		routeLink.href = hemocenter.routeUrl || '#';

		fragment.append(card);
	});

	hemocenterList.append(fragment);
	if (window.lucide) window.lucide.createIcons();
	resultsSummary.textContent = `${hemocentersToShow.length} unidade${hemocentersToShow.length === 1 ? '' : 's'} encontrada${hemocentersToShow.length === 1 ? '' : 's'}.`;
}

function filterByDistance(items = hemocenters) {
	const maxDistance = Number(distanceSelect.value);
	return items.filter((hemocenter) => !hemocenter.distance || hemocenter.distance <= maxDistance);
}

async function loadHemocenters(location) {
	// Sem uma URL configurada, usamos dados locais para testar a interface.
	if (!hemocentersApiUrl) {
		return filterByDistance();
	}

	// Quando o backend existir, ele receberá a localização e o limite de distância.
	const params = new URLSearchParams({
		location,
		maxDistance: distanceSelect.value
	});
	const response = await fetch(`${hemocentersApiUrl}?${params.toString()}`);

	if (!response.ok) {
		throw new Error(`Erro ao buscar hemocentros: ${response.status}`);
	}

	const responseData = await response.json();
	return Array.isArray(responseData) ? responseData : responseData.hemocenters || [];
}

async function searchHemocenters(event) {
	event.preventDefault();
	const location = locationInput.value.trim();

	if (!location) {
		setStatus('Informe uma cidade, estado ou CEP para realizar a busca.', true);
		locationInput.focus();
		return;
	}

	setStatus(`Buscando unidades próximas de ${location}...`);

	try {
		hemocenters = await loadHemocenters(location);
		renderHemocenters(filterByDistance(hemocenters));
		setStatus('Busca concluída.');
	} catch (error) {
		console.error(error);
		showEmptyState('Não foi possível concluir a busca', 'Verifique sua conexão e tente novamente.');
		resultsSummary.textContent = 'Erro ao carregar os resultados.';
		setStatus('Não foi possível consultar os hemocentros agora.', true);
	}
}

async function useCurrentLocation() {
	if (!navigator.geolocation) {
		setStatus('Seu navegador não oferece acesso à localização. Digite sua cidade ou CEP.', true);
		return;
	}

	setStatus('Solicitando sua localização...');
	useLocationButton.disabled = true;

	navigator.geolocation.getCurrentPosition(
		async ({ coords }) => {
			locationInput.value = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;

			try {
				hemocenters = await loadHemocenters(locationInput.value);
				renderHemocenters(filterByDistance(hemocenters));
				setStatus('Localização encontrada. Resultados exibidos.');
			} catch (error) {
				console.error(error);
				showEmptyState('Não foi possível concluir a busca', 'Verifique sua conexão e tente novamente.');
				resultsSummary.textContent = 'Erro ao carregar os resultados.';
				setStatus('Não foi possível consultar os hemocentros agora.', true);
			} finally {
				useLocationButton.disabled = false;
			}
		},
		() => {
			setStatus('Não foi possível acessar sua localização. Digite sua cidade ou CEP.', true);
			useLocationButton.disabled = false;
		}
	);
}

openMenuButton.addEventListener('click', () => setMenuState(true));
closeMenuButton.addEventListener('click', () => setMenuState(false));
overlay.addEventListener('click', () => setMenuState(false));
locationForm.addEventListener('submit', searchHemocenters);
useLocationButton.addEventListener('click', useCurrentLocation);
distanceSelect.addEventListener('change', () => {
	if (locationInput.value.trim()) {
		renderHemocenters(filterByDistance());
	}
});

const API_URL = "http://127.0.0.1:8000";


async function carregarDoadores() {
    const total = document.getElementById("totalDoadores");
    const lista = document.getElementById("listaDoadores");

    if (!total || !lista) {
        console.error("A seção de doadores não foi encontrada no Dashboard.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/doadores`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const doadores = await resposta.json();

        total.textContent = `Total de doadores: ${doadores.length}`;
        lista.replaceChildren();

        if (doadores.length === 0) {
            lista.textContent = "Ainda não há doadores cadastrados.";
            return;
        }

        doadores.forEach((doador) => {
            const card = document.createElement("div");
            card.style.padding = "12px";
            card.style.marginTop = "10px";
            card.style.border = "1px solid #dce7e5";
            card.style.borderRadius = "10px";

            const nome = document.createElement("h4");
            nome.textContent = doador.nome;

            const detalhes = document.createElement("p");
            detalhes.textContent =
                `${doador.tipo_sanguineo} • ${doador.cidade}`;

            const disponibilidade = document.createElement("p");
            disponibilidade.textContent = doador.disponivel
                ? "Disponível para contato"
                : "Indisponível no momento";

            card.append(nome, detalhes, disponibilidade);
            lista.appendChild(card);
        });

        console.log("Doadores carregados:", doadores.length);

    } catch (erro) {
        total.textContent = "Não foi possível carregar os doadores.";
        console.error("Erro ao carregar doadores:", erro);
    }
}

document.addEventListener("DOMContentLoaded", carregarDoadores);

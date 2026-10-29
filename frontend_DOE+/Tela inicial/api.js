
const API_URL = "http://127.0.0.1:8001";

async function testarConexaoDoeMais() {
  try {
    const resposta = await fetch(`${API_URL}/doadores`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const doadores = await resposta.json();

    console.log("Conexão com a API Doe+ realizada!");
    console.log("Total de doadores encontrados:", doadores.length);
    console.log("Dados recebidos:", doadores);

  } catch (erro) {
    console.error("Falha na conexão com a API Doe+:", erro);
  }
}

testarConexaoDoeMais();

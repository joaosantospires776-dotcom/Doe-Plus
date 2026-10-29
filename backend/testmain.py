import pytest
from fastapi.testclient import TestClient
from main import app  

client = TestClient(app)


def test_rota_inicio():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "mensagem": "Backend de Ciência de Dados funcionando"
    }


def test_consulta_resumo_sucesso():
    response = client.get("/analise/resumo")
    if response.status_code == 200:
        dados = response.json()
        assert "linhas_itens" in dados
        assert "valor_total" in dados
    else:
        assert response.status_code == 503

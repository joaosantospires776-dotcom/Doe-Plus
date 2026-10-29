import shutil

import pytest
from fastapi.testclient import TestClient

import analise
import main
from main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """Usa uma cópia do CSV para o POST não alterar o arquivo real."""
    copia = tmp_path / "compras_20.csv"
    shutil.copy(analise.CAMINHO_CSV, copia)
    monkeypatch.setattr(analise, "CAMINHO_CSV", copia)
    monkeypatch.setattr(main, "CAMINHO_CSV", copia)
    return TestClient(app)


NOVA_COMPRA = {
    "id_compra": 99,
    "dt_compra": "2026-10-15",
    "id_cliente": 101,
    "nm_cliente": "Ana Souza",
    "id_produto": 501,
    "nm_produto": "Teclado Mecânico",
    "qt_estoque": 40,
    "qt_compra": 2,
    "vl_produto": 250.0,
    "pc_desconto": 10,
}


def test_rota_inicio(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "mensagem": "Backend de Ciência de Dados funcionando"
    }


def test_get_resumo(client):
    response = client.get("/analise/resumo")
    assert response.status_code == 200
    dados = response.json()
    assert dados["linhas_itens"] == 20
    assert "valor_total" in dados


def test_get_produtos(client):
    response = client.get("/analise/produtos")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_get_datas(client):
    response = client.get("/analise/datas")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_post_compra_sucesso(client):
    antes = client.get("/analise/resumo").json()["linhas_itens"]
    response = client.post("/compras", json=NOVA_COMPRA)
    assert response.status_code == 201
    assert response.json()["valor_item"] == 450.0
    depois = client.get("/analise/resumo").json()["linhas_itens"]
    assert depois == antes + 1


def test_post_duplicado_retorna_409(client):
    assert client.post("/compras", json=NOVA_COMPRA).status_code == 201
    assert client.post("/compras", json=NOVA_COMPRA).status_code == 409


def test_post_desconto_invalido_retorna_422(client):
    ruim = {**NOVA_COMPRA, "pc_desconto": 150}
    assert client.post("/compras", json=ruim).status_code == 422


def test_post_campo_ausente_retorna_422(client):
    ruim = {k: v for k, v in NOVA_COMPRA.items() if k != "nm_cliente"}
    assert client.post("/compras", json=ruim).status_code == 422


def test_post_cliente_conflitante_retorna_422(client):
    # id_compra 1 já pertence ao cliente 101; outro cliente na mesma compra é conflito
    ruim = {**NOVA_COMPRA, "id_compra": 1, "id_cliente": 999,
            "id_produto": 777, "dt_compra": "2026-09-01"}
    assert client.post("/compras", json=ruim).status_code == 422

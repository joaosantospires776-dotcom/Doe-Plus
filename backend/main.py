from fastapi import FastAPI, HTTPException
import pandas as pd
from analise import ler_dados, por_data, por_produto, resumo

app = FastAPI(title="Ciência de Dados com CSV")


def carregar_dados():
    try:
        return ler_dados()
    except (OSError, UnicodeError) as erro:
        raise HTTPException(
            status_code=503,
            detail="Não foi possível abrir database/compras_20.csv.",
        ) from erro
    except (ValueError, pd.errors.ParserError) as erro:
        raise HTTPException(
            status_code=422,
            detail="Confira o cabeçalho, as datas e os números do CSV.",
        ) from erro


@app.get("/")
def inicio():
    return {"mensagem": "Backend de Ciência de Dados funcionando"}


@app.get("/analise/resumo")
def consultar_resumo():
    dados = carregar_dados()
    return resumo(dados)


@app.get("/analise/produtos")
def consultar_produtos():
    dados = carregar_dados()
    return por_produto(dados)


@app.get("/analise/datas")
def consultar_datas():
    dados = carregar_dados()
    return por_data(dados)

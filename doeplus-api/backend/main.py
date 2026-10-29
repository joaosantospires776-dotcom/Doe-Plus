import os
import tempfile
import threading
from datetime import date

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from analise import (
    CAMINHO_CSV,
    COLUNAS,
    ler_csv_bruto,
    ler_dados,
    por_data,
    por_produto,
    resumo,
    validar_e_calcular,
)

app = FastAPI(title="Ciência de Dados com CSV")

# Necessário se o front-end rodar em outra porta/origem (ex.: localhost:3000).
# Em produção, troque "*" pela origem real do front-end.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Evita duas requisições POST gravando o CSV ao mesmo tempo.
_trava_csv = threading.Lock()


class CompraItem(BaseModel):
    """Uma linha do CSV: um produto dentro de uma compra."""

    id_compra: int = Field(gt=0, examples=[21])
    dt_compra: date = Field(examples=["2026-10-15"])
    id_cliente: int = Field(gt=0, examples=[101])
    nm_cliente: str = Field(min_length=1, examples=["Ana Souza"])
    id_produto: int = Field(gt=0, examples=[501])
    nm_produto: str = Field(min_length=1, examples=["Teclado Mecânico"])
    qt_estoque: int = Field(ge=0, examples=[40])
    qt_compra: int = Field(ge=0, examples=[2])
    vl_produto: float = Field(ge=0, allow_inf_nan=False, examples=[250.0])
    pc_desconto: float = Field(ge=0, le=100, allow_inf_nan=False, examples=[10])


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


def gravar_csv(df):
    """Grava em arquivo temporário e troca no final, para não corromper o CSV."""
    pasta = CAMINHO_CSV.parent
    fd, tmp = tempfile.mkstemp(dir=pasta, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as f:
            df.to_csv(f, index=False, lineterminator="\n")
        os.replace(tmp, CAMINHO_CSV)
    except BaseException:
        if os.path.exists(tmp):
            os.remove(tmp)
        raise


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


@app.post("/compras", status_code=201)
def cadastrar_compra(item: CompraItem):
    """Acrescenta uma linha (item de compra) ao CSV depois de validar."""
    novo = item.model_dump()
    novo["dt_compra"] = item.dt_compra.isoformat()

    with _trava_csv:
        try:
            bruto = ler_csv_bruto()
        except (OSError, UnicodeError) as erro:
            raise HTTPException(
                status_code=503,
                detail="Não foi possível abrir database/compras_20.csv.",
            ) from erro
        except (ValueError, pd.errors.ParserError) as erro:
            raise HTTPException(
                status_code=422,
                detail="O CSV atual está inválido; corrija-o antes de cadastrar.",
            ) from erro

        ja_existe = (bruto["id_compra"] == novo["id_compra"]) & (
            bruto["id_produto"] == novo["id_produto"]
        )
        if ja_existe.any():
            raise HTTPException(
                status_code=409,
                detail="Esse produto já foi cadastrado nessa compra.",
            )

        combinado = pd.concat(
            [bruto[COLUNAS], pd.DataFrame([novo])[COLUNAS]], ignore_index=True
        )
        try:
            # Reaproveita todas as regras de leitura (datas/clientes conflitantes etc.)
            validar_e_calcular(combinado)
        except ValueError as erro:
            raise HTTPException(status_code=422, detail=str(erro)) from erro

        try:
            gravar_csv(combinado)
        except OSError as erro:
            raise HTTPException(
                status_code=503,
                detail="Não foi possível gravar database/compras_20.csv.",
            ) from erro

    valor_item = round(
        item.qt_compra * item.vl_produto * (1 - item.pc_desconto / 100), 2
    )
    return {"mensagem": "Compra cadastrada", "item": novo, "valor_item": valor_item}

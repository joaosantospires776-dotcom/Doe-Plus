
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash

import models
import schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

password_hash = PasswordHash.recommended()

app = FastAPI(
    title="Doe+ API",
    description="API da plataforma Doe+ para incentivo à doação de sangue",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def inicio():
    return {
        "mensagem": "Bem-vindo à API do Doe+!",
        "status": "online"
    }


@app.post(
    "/doadores",
    response_model=schemas.DoadorResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_doador(
    dados: schemas.DoadorCreate,
    db: Session = Depends(get_db)
):
    email = str(dados.email).strip().lower()

    existente = db.query(models.Doador).filter(
        models.Doador.email == email
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="Já existe um doador com esse e-mail."
        )

    valores = dados.model_dump(exclude={"senha"})
    valores["email"] = email
    valores["senha_hash"] = password_hash.hash(dados.senha)

    doador = models.Doador(**valores)
    db.add(doador)

    try:
        db.commit()
        db.refresh(doador)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Não foi possível cadastrar: e-mail já existente."
        )

    return doador


@app.post("/login", response_model=schemas.LoginResponse)
def login(
    dados: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    email = str(dados.email).strip().lower()

    doador = db.query(models.Doador).filter(
        models.Doador.email == email
    ).first()

    if (
        not doador
        or not doador.senha_hash
        or not password_hash.verify(dados.senha, doador.senha_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    return {
        "mensagem": "Login realizado com sucesso.",
        "doador": doador
    }


@app.get("/doadores", response_model=list[schemas.DoadorResponse])
def listar_doadores(db: Session = Depends(get_db)):
    return db.query(models.Doador).order_by(models.Doador.id).all()


@app.get("/doadores/{doador_id}", response_model=schemas.DoadorResponse)
def buscar_doador(
    doador_id: int,
    db: Session = Depends(get_db)
):
    doador = db.query(models.Doador).filter(
        models.Doador.id == doador_id
    ).first()

    if not doador:
        raise HTTPException(
            status_code=404,
            detail="Doador não encontrado."
        )

    return doador


@app.put("/doadores/{doador_id}", response_model=schemas.DoadorResponse)
def atualizar_doador(
    doador_id: int,
    dados: schemas.DoadorUpdate,
    db: Session = Depends(get_db)
):
    doador = db.query(models.Doador).filter(
        models.Doador.id == doador_id
    ).first()

    if not doador:
        raise HTTPException(
            status_code=404,
            detail="Doador não encontrado."
        )

    alteracoes = dados.model_dump(exclude_unset=True)

    if "email" in alteracoes and alteracoes["email"] is not None:
        alteracoes["email"] = str(alteracoes["email"]).strip().lower()

        outro = db.query(models.Doador).filter(
            models.Doador.email == alteracoes["email"],
            models.Doador.id != doador_id
        ).first()

        if outro:
            raise HTTPException(
                status_code=409,
                detail="E-mail já cadastrado."
            )

    for campo, valor in alteracoes.items():
        setattr(doador, campo, valor)

    try:
        db.commit()
        db.refresh(doador)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Não foi possível atualizar."
        )

    return doador


@app.delete("/doadores/{doador_id}")
def excluir_doador(
    doador_id: int,
    db: Session = Depends(get_db)
):
    doador = db.query(models.Doador).filter(
        models.Doador.id == doador_id
    ).first()

    if not doador:
        raise HTTPException(
            status_code=404,
            detail="Doador não encontrado."
        )

    db.delete(doador)
    db.commit()

    return {"mensagem": "Doador excluído com sucesso."}

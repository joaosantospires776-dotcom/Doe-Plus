
from sqlalchemy import Boolean, Column, Integer, String
from database import Base


class Doador(Base):
    __tablename__ = "doadores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    telefone = Column(String(20), nullable=False)
    tipo_sanguineo = Column(String(3), nullable=False)
    cidade = Column(String(100), nullable=False)
    disponivel = Column(Boolean, default=True, nullable=False)

    # Campo para armazenar a senha protegida
    senha_hash = Column(String(255), nullable=True)

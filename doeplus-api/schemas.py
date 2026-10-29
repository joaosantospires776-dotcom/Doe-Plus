
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class DoadorCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr
    telefone: str = Field(min_length=8, max_length=20)
    tipo_sanguineo: str = Field(pattern=r"^(A|B|AB|O)[+-]$")
    cidade: str = Field(min_length=2, max_length=100)
    disponivel: bool = True
    senha: str = Field(min_length=8, max_length=128)


class DoadorUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    telefone: str | None = Field(default=None, min_length=8, max_length=20)
    tipo_sanguineo: str | None = Field(
        default=None,
        pattern=r"^(A|B|AB|O)[+-]$"
    )
    cidade: str | None = Field(default=None, min_length=2, max_length=100)
    disponivel: bool | None = None


class DoadorResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str
    tipo_sanguineo: str
    cidade: str
    disponivel: bool

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    mensagem: str
    doador: DoadorResponse

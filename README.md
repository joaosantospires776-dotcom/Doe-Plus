# Doe+ — Plataforma Inteligente para Incentivo à Doação de Sangue

**Plataforma inteligente para informação e incentivo à doação de sangue.**

O Doe+ é um projeto desenvolvido com o objetivo de incentivar a doação de sangue, facilitar o acesso a informações sobre o processo de doação e aproximar doadores dos hemocentros. A proposta busca contribuir para a conscientização da população e para o fortalecimento da rede de doação de sangue.

##  Objetivo do projeto

- Incentivar a doação voluntária de sangue.
- Disponibilizar informações sobre doação e hemocentros.
- Facilitar o acesso a recursos e funcionalidades para os doadores.
- Promover a conscientização sobre a importância da doação de sangue.
- Utilizar a tecnologia como ferramenta de apoio à saúde pública.

##  Funcionalidades

O projeto reúne interfaces e recursos voltados à experiência do usuário, incluindo:

- Página inicial e apresentação da plataforma.
- Tela de acesso e gerenciamento de sessão.
- Dashboard do usuário.
- Área de benefícios.
- Consulta de hemocentros próximos.
- Perfil do usuário.
- Interface de conversa com a assistente virtual LIA.
- Integração do frontend com uma API.


##  Sistemas utilizadas

### Frontend
- HTML5 — estrutura das páginas.
- CSS3 — estilos e layout.
- JavaScript — interatividade e lógica das interfaces.

### Backend e API
- Python — linguagem utilizada no desenvolvimento do backend.
- FastAPI — framework para criação de APIs.
- SQLAlchemy — ferramenta de interação com o banco de dados.
- Pydantic — validação e estruturação de dados.

### Banco de dados
- SQLite — banco de dados local utilizado na configuração da API.

### Ferramentas
- Visual Studio Code.
- Git e GitHub.
- Live Server para executar páginas do frontend durante o desenvolvimento.

##  Estrutura do projeto

```text
DOE+/
├── backend/
│   ├── analise.py
│   ├── main.py
│   ├── requirements.txt
│   └── testmain.py
├── database/
│   └── CSV-doe-dados-10k - CSV-doe-dados-10k.csv
├── doeplus-api/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── requirements.txt
├── frontend_DOE+/
│   ├── assets/
│   ├── Tela inicial/
│   ├── tela_acesso/
│   ├── tela_boasvindas/
│   ├── tela_benefícios/
│   ├── tela_chatbot/
│   ├── tela_dashboard/
│   ├── tela_hemoc_próximos/
│   └── tela_perfil/
├── .gitignore
└── README.md
```

##  Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/joaosantospires776-dotcom/Doe-Plus.git
cd Doe-Plus
```

### 2. Executar a API

A API principal está na pasta `doeplus-api`.

```bash
cd doeplus-api
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy
uvicorn main:app --reload
```

Depois, acesse a documentação interativa da API:

http://127.0.0.1:8000/docs

### 3. Executar o frontend

Abra a pasta `frontend_DOE+` no Visual Studio Code e utilize a extensão Live Server para executar a página inicial do projeto.

**Importante:** a integração entre frontend e API depende das URLs configuradas nos arquivos JavaScript e da API estar em execução.

##  Dados de demonstração

O projeto contém arquivos CSV utilizados para testes e análises. Os conjuntos de dados destinados à demonstração devem conter exclusivamente dados fictícios, sem informações pessoais reais.

##  Informações acadêmicas

- **Projeto:** Doe+
- **Instituição:** CEEP Maringá — Centro Estadual de Educação Profissional Padre Joseir Sversutti
- **Área:** Ciências da Saúde
- **ODS:** Objetivo de Desenvolvimento Sustentável 3 — Saúde e Bem-Estar
- **Ano:** 2026

### Orientação

- **Orientadora:** Cláudia Patrícia de Assis Gonçalves
- **Coorientador:** Giuliano Alencar Tiburcio

### Integrantes

- Gabrielly Menotti de Almeida
- Giovana Gobetti da Silva
- João Emanuel Pereira Pires Abreu
- Julia Eduarda Gomes da Silva
- Maria Vitória Correia
- Niara Beatriz Ferreira Ramos
- Samuel Misga de Aguiar
- Vinícius de Jesus Nogueira

##  Impacto social

O Doe+ busca contribuir para a conscientização sobre a doação voluntária de sangue, destacando o papel da tecnologia na divulgação de informações e no apoio aos serviços de saúde.

---

**Doe+ — Tecnologia que conecta pessoas e incentiva a doação de sangue.**

Desenvolvido por MedIA-Tech • 2026

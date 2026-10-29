from pathlib import Path
import pandas as pd

CAMINHO_CSV = Path(__file__).resolve().parent / "database" / "compras_20.csv"


def ler_dados():
    df = pd.read_csv(CAMINHO_CSV)
    colunas = [
        "id_compra",
        "dt_compra",
        "id_cliente",
        "nm_cliente",
        "id_produto",
        "nm_produto",
        "qt_estoque",
        "qt_compra",
        "vl_produto",
        "pc_desconto",
    ]
    if not set(colunas).issubset(df.columns):
        raise ValueError("Confira as dez colunas do CSV.")

    df = df[colunas].copy()
    if df.empty or df.isna().any().any():
        raise ValueError("O CSV está vazio ou contém campos ausentes.")

    df["dt_compra"] = pd.to_datetime(
        df["dt_compra"], format="%Y-%m-%d", errors="raise"
    )

    numeros = [
        "id_compra",
        "id_cliente",
        "id_produto",
        "qt_estoque",
        "qt_compra",
        "vl_produto",
        "pc_desconto",
    ]
    for coluna in numeros:
        df[coluna] = pd.to_numeric(df[coluna], errors="raise")

    if df[numeros].isin([float("inf"), -float("inf")]).any().any():
        raise ValueError("O CSV contém valores infinitos.")

    for coluna in [
        "id_compra",
        "id_cliente",
        "id_produto",
        "qt_estoque",
        "qt_compra",
    ]:
        if (df[coluna] % 1 != 0).any():
            raise ValueError("IDs e quantidades devem ser inteiros.")

    if (df[["id_compra", "id_cliente", "id_produto"]] <= 0).any().any():
        raise ValueError("Os identificadores devem ser positivos.")

    if (df[["qt_estoque", "qt_compra", "vl_produto"]] < 0).any().any():
        raise ValueError("Quantidade e preço não podem ser negativos.")

    if not df["pc_desconto"].between(0, 100).all():
        raise ValueError("Desconto deve estar entre 0 e 100.")

    if df.duplicated().any():
        raise ValueError(
            "Há linhas idênticas. Verifique a fonte antes de analisar."
        )

    for coluna in ["dt_compra", "id_cliente"]:
        if (df.groupby("id_compra")[coluna].nunique() > 1).any():
            raise ValueError("Uma compra tem datas ou clientes conflitantes.")

    df["valor_item"] = (
        df["qt_compra"] * df["vl_produto"] * (1 - df["pc_desconto"] / 100)
    ).round(2)
    return df


def resumo(df):
    totais_compra = df.groupby("id_compra")["valor_item"].sum()
    return {
        "linhas_itens": int(len(df)),
        "total_compras": int(df["id_compra"].nunique()),
        "total_clientes": int(df["id_cliente"].nunique()),
        "total_produtos": int(df["id_produto"].nunique()),
        "total_unidades": int(df["qt_compra"].sum()),
        "valor_total": round(float(df["valor_item"].sum()), 2),
        "media_por_compra": round(float(totais_compra.mean()), 2),
        "mediana_por_compra": float(totais_compra.median().round(2)),
        "data_inicial": df["dt_compra"].min().strftime("%Y-%m-%d"),
        "data_final": df["dt_compra"].max().strftime("%Y-%m-%d"),
    }


def por_produto(df):
    tabela = df.groupby(["id_produto", "nm_produto"], as_index=False).agg(
        unidades=("qt_compra", "sum"),
        valor_total=("valor_item", "sum"),
    )
    tabela["valor_total"] = tabela["valor_total"].round(2)
    tabela = tabela.sort_values("unidades", ascending=False)
    return tabela.to_dict(orient="records")


def por_data(df):
    tabela = df.groupby("dt_compra", as_index=False).agg(
        total_compras=("id_compra", "nunique"),
        valor_total=("valor_item", "sum"),
    )
    tabela["valor_total"] = tabela["valor_total"].round(2)
    tabela["dt_compra"] = tabela["dt_compra"].dt.strftime("%Y-%m-%d")
    return tabela.to_dict(orient="records")


if __name__ == "__main__":
    try:
        dados = ler_dados()
        print("Primeiros cinco itens:")
        print(dados.head())
        print("\nResumo:")
        print(resumo(dados))
    except Exception as e:
        print(f"Erro ao testar leitura: {e}")

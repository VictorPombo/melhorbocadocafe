import { MOCK_VENDAS, getVendasByPeriodo, type Venda } from "@/lib/mock-data";

export interface ProdutoRank {
  nome: string;
  qtd: number;
  faturamento: number;
}

export interface Associacao {
  produtoA: string;
  produtoB: string;
  percentual: number;
  qtdVendas: number;
}

/** Top produtos por quantidade vendida */
export function calcTopProdutos(periodo: number = 30): ProdutoRank[] {
  const vendas = getVendasByPeriodo(periodo);
  const map: Record<string, { qtd: number; fat: number }> = {};
  vendas.forEach((v) =>
    v.itens.forEach((i) => {
      if (!map[i.produtoNome]) map[i.produtoNome] = { qtd: 0, fat: 0 };
      map[i.produtoNome].qtd += i.quantidade;
      map[i.produtoNome].fat += i.valorUnitario * i.quantidade;
    }),
  );
  return Object.entries(map)
    .map(([nome, d]) => ({ nome, qtd: d.qtd, faturamento: d.fat }))
    .sort((a, b) => b.qtd - a.qtd);
}

/** Produtos comprados juntos — analisa co-ocorrência na mesma venda */
export function calcAssociacoes(periodo: number = 90): Associacao[] {
  const vendas = getVendasByPeriodo(periodo).filter((v) => v.itens.length >= 2);
  const pairs: Record<string, { count: number; totalA: number }> = {};
  const prodCount: Record<string, number> = {};

  vendas.forEach((v) => {
    const nomes = [...new Set(v.itens.map((i) => i.produtoNome))];
    nomes.forEach((n) => { prodCount[n] = (prodCount[n] || 0) + 1; });
    for (let i = 0; i < nomes.length; i++) {
      for (let j = i + 1; j < nomes.length; j++) {
        const key = [nomes[i], nomes[j]].sort().join("|||");
        if (!pairs[key]) pairs[key] = { count: 0, totalA: 0 };
        pairs[key].count++;
      }
    }
  });

  return Object.entries(pairs)
    .map(([key, data]) => {
      const [produtoA, produtoB] = key.split("|||");
      const baseCount = Math.min(prodCount[produtoA] || 1, prodCount[produtoB] || 1);
      const percentual = Math.round((data.count / baseCount) * 100);
      return { produtoA, produtoB, percentual, qtdVendas: data.count };
    })
    .filter((a) => a.qtdVendas >= 2)
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, 5);
}

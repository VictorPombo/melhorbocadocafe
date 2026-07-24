import { MOCK_VENDAS, MOCK_CLIENTES, getVendasByCliente, getTotalGasto, getUltimaCompra, type Cliente } from "@/lib/mock-data";

export interface ClienteScore {
  cliente: Cliente;
  score: number;
  nivel: "excelente" | "bom" | "atencao" | "inativo";
  tier: "ouro" | "prata" | "bronze" | null;
  totalGasto: number;
  numCompras: number;
  diasDesdeUltima: number;
}

export interface ClienteRisco {
  cliente: Cliente;
  diasInativo: number;
  freqAnterior: string;
  nivel: "alto" | "medio" | "baixo";
}

export interface Recuperaveis {
  qtd: number;
  totalHistorico: number;
  potencial20pct: number;
  clientes: Cliente[];
}

/** Score 0-100: 40% valor, 30% frequência, 30% recência */
export function calcScoreCliente(clienteId: string): ClienteScore {
  const cliente = MOCK_CLIENTES.find((c) => c.id === clienteId)!;
  const vendas = getVendasByCliente(clienteId);
  const totalGasto = getTotalGasto(clienteId);
  const numCompras = vendas.length;
  const ultima = getUltimaCompra(clienteId);
  const diasDesdeUltima = ultima ? Math.floor((Date.now() - new Date(ultima).getTime()) / 86400000) : 999;

  // Normalize to 0-100
  const maxGasto = Math.max(...MOCK_CLIENTES.map((c) => getTotalGasto(c.id)), 1);
  const maxCompras = Math.max(...MOCK_CLIENTES.map((c) => getVendasByCliente(c.id).length), 1);

  const scoreValor = Math.min(100, (totalGasto / maxGasto) * 100);
  const scoreFreq = Math.min(100, (numCompras / maxCompras) * 100);
  const scoreRecencia = diasDesdeUltima <= 7 ? 100 : diasDesdeUltima <= 14 ? 80 : diasDesdeUltima <= 30 ? 50 : diasDesdeUltima <= 60 ? 20 : 0;

  const score = Math.round(scoreValor * 0.4 + scoreFreq * 0.3 + scoreRecencia * 0.3);
  const nivel = score >= 80 ? "excelente" : score >= 60 ? "bom" : score >= 40 ? "atencao" : "inativo";
  const tier = score >= 80 ? "ouro" : score >= 60 ? "prata" : score >= 40 ? "bronze" : null;

  return { cliente, score, nivel, tier, totalGasto, numCompras, diasDesdeUltima };
}

/** Todos os clientes com score */
export function calcAllScores(): ClienteScore[] {
  return MOCK_CLIENTES.map((c) => calcScoreCliente(c.id)).sort((a, b) => b.score - a.score);
}

/** Clientes VIP (ouro/prata/bronze) */
export function calcVIPs(): { ouro: ClienteScore[]; prata: ClienteScore[]; bronze: ClienteScore[] } {
  const all = calcAllScores();
  return {
    ouro: all.filter((c) => c.tier === "ouro"),
    prata: all.filter((c) => c.tier === "prata"),
    bronze: all.filter((c) => c.tier === "bronze"),
  };
}

/** Clientes em risco */
export function calcClientesRisco(): ClienteRisco[] {
  const hoje = new Date();
  return MOCK_CLIENTES
    .map((c) => {
      const vendas = getVendasByCliente(c.id);
      if (vendas.length < 2) return null;
      const ultima = getUltimaCompra(c.id);
      if (!ultima) return null;
      const diasInativo = Math.floor((hoje.getTime() - new Date(ultima).getTime()) / 86400000);
      if (diasInativo < 14) return null;

      // Calcular frequência anterior
      const datas = vendas.map((v) => new Date(v.criadoEm).getTime()).sort();
      const gaps = datas.slice(1).map((d, i) => (d - datas[i]) / 86400000);
      const avgGap = gaps.length > 0 ? gaps.reduce((s, g) => s + g, 0) / gaps.length : 0;
      const freqAnterior = avgGap <= 7 ? "Semanal" : avgGap <= 14 ? "Quinzenal" : "Mensal";

      const nivel = diasInativo >= 45 ? "alto" : diasInativo >= 30 ? "medio" : "baixo";
      return { cliente: c, diasInativo, freqAnterior, nivel } as ClienteRisco;
    })
    .filter(Boolean) as ClienteRisco[];
}

/** Clientes recuperáveis */
export function calcRecuperaveis(): Recuperaveis {
  const hoje = new Date();
  const inativos = MOCK_CLIENTES.filter((c) => {
    const ult = getUltimaCompra(c.id);
    if (!ult) return true;
    return (hoje.getTime() - new Date(ult).getTime()) / 86400000 >= 30;
  });
  const totalHistorico = inativos.reduce((s, c) => s + getTotalGasto(c.id), 0);
  return {
    qtd: inativos.length,
    totalHistorico,
    potencial20pct: Math.round(totalHistorico * 0.2),
    clientes: inativos,
  };
}

// =============================================================================
// Análise Demográfica do Público-Alvo e Frequência de Recorrência
// Utilitários para filtragem e otimização de campanhas de marketing
// =============================================================================

import type { Cliente, CanalAquisicao } from "./types";

export type FaixaEtaria = "18-24" | "25-34" | "35-44" | "45-54" | "55+";

export type FaixaFrequencia = "1_visita" | "2_4_visitas" | "5_9_visitas" | "10_mais";

export interface FiltrosPublico {
  faixaEtaria: "todos" | FaixaEtaria;
  faixaFrequencia: "todos" | FaixaFrequencia;
  canalAquisicao: "todos" | CanalAquisicao;
  apenasVips: boolean;
  apenasEmRisco: boolean;
}

export interface Metricapublico {
  totalClientes: number;
  idadeMedia: number;
  frequenciaMediaVisitas: number;
  taxaRecorrencia: number; // Porcentagem de clientes com >1 compra
  ticketMedioGeral: number;
  ltvMedio: number;
}

export interface DistribuicaoFaixaEtaria {
  faixa: FaixaEtaria;
  rotulo: string;
  quantidade: number;
  porcentagem: number;
  frequenciaMedia: number;
  ticketMedio: number;
}

export interface DistribuicaoFrequencia {
  faixa: FaixaFrequencia;
  rotulo: string;
  quantidade: number;
  porcentagem: number;
  gastoMedio: number;
}

export interface CampanhaRecomendada {
  id: string;
  titulo: string;
  publicoAlvo: string;
  descricao: string;
  potencialAlcance: number;
  sugestaoOferta: string;
  canalRecomendado: string;
  urgencia: "alta" | "media" | "baixa";
}

/**
 * Calcula a idade de uma pessoa a partir da data YYYY-MM-DD.
 */
export function calcularIdade(nascimento: string): number {
  if (!nascimento) return 30;
  const hoje = new Date();
  const nasc = new Date(nascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade > 0 ? idade : 30;
}

/**
 * Retorna a faixa etária correspondente à idade.
 */
export function getFaixaEtaria(idade: number): FaixaEtaria {
  if (idade <= 24) return "18-24";
  if (idade <= 34) return "25-34";
  if (idade <= 44) return "35-44";
  if (idade <= 54) return "45-54";
  return "55+";
}

/**
 * Retorna a faixa de frequência de visitas baseada no número de compras.
 */
export function getFaixaFrequencia(qtdCompras: number): FaixaFrequencia {
  if (qtdCompras <= 1) return "1_visita";
  if (qtdCompras <= 4) return "2_4_visitas";
  if (qtdCompras <= 9) return "5_9_visitas";
  return "10_mais";
}

/**
 * Filtra clientes com base nos critérios demográficos e de frequência.
 */
export function filtrarClientesPublico(
  clientes: Cliente[],
  filtros: FiltrosPublico
): Cliente[] {
  const agora = Date.now();
  const quinzeDiasMs = 15 * 24 * 60 * 60 * 1000;

  return clientes.filter((c) => {
    // Filtro por Idade
    if (filtros.faixaEtaria !== "todos") {
      const idade = calcularIdade(c.nascimento);
      if (getFaixaEtaria(idade) !== filtros.faixaEtaria) return false;
    }

    // Filtro por Frequência de Visita
    if (filtros.faixaFrequencia !== "todos") {
      if (getFaixaFrequencia(c.qtd_compras) !== filtros.faixaFrequencia)
        return false;
    }

    // Filtro por Canal de Origem
    if (filtros.canalAquisicao !== "todos") {
      if (c.canal_aquisicao !== filtros.canalAquisicao) return false;
    }

    // Apenas VIPs
    if (filtros.apenasVips && !c.vip) return false;

    // Apenas Clientes em Risco (não visitam há mais de 15 dias)
    if (filtros.apenasEmRisco) {
      if (!c.ultima_compra_em) return false;
      const diasInativo =
        (agora - new Date(c.ultima_compra_em).getTime()) / (1000 * 60 * 60 * 24);
      if (diasInativo < 15 || c.qtd_compras < 2) return false;
    }

    return true;
  });
}

/**
 * Calcula métricas gerais do público filtrado.
 */
export function calcularMetricasPublico(clientes: Cliente[]): Metricapublico {
  if (clientes.length === 0) {
    return {
      totalClientes: 0,
      idadeMedia: 0,
      frequenciaMediaVisitas: 0,
      taxaRecorrencia: 0,
      ticketMedioGeral: 0,
      ltvMedio: 0,
    };
  }

  const somaIdade = clientes.reduce(
    (acc, c) => acc + calcularIdade(c.nascimento),
    0
  );
  const somaCompras = clientes.reduce((acc, c) => acc + c.qtd_compras, 0);
  const recorrentes = clientes.filter((c) => c.qtd_compras > 1).length;
  const somaTicket = clientes.reduce((acc, c) => acc + c.ticket_medio, 0);
  const somaLtv = clientes.reduce((acc, c) => acc + c.ltv, 0);

  return {
    totalClientes: clientes.length,
    idadeMedia: Math.round((somaIdade / clientes.length) * 10) / 10,
    frequenciaMediaVisitas:
      Math.round((somaCompras / clientes.length) * 10) / 10,
    taxaRecorrencia: Math.round((recorrentes / clientes.length) * 100),
    ticketMedioGeral: Math.round((somaTicket / clientes.length) * 100) / 100,
    ltvMedio: Math.round((somaLtv / clientes.length) * 100) / 100,
  };
}

/**
 * Gera distribuição gráfica por Faixa Etária.
 */
export function calcularDistribuicaoEtaria(
  clientes: Cliente[]
): DistribuicaoFaixaEtaria[] {
  const faixas: { faixa: FaixaEtaria; rotulo: string }[] = [
    { faixa: "18-24", rotulo: "18 a 24 anos" },
    { faixa: "25-34", rotulo: "25 a 34 anos" },
    { faixa: "35-44", rotulo: "35 a 44 anos" },
    { faixa: "45-54", rotulo: "45 a 54 anos" },
    { faixa: "55+", rotulo: "55+ anos" },
  ];

  const total = clientes.length || 1;

  return faixas.map(({ faixa, rotulo }) => {
    const grupo = clientes.filter(
      (c) => getFaixaEtaria(calcularIdade(c.nascimento)) === faixa
    );
    const qtd = grupo.length;
    const somaCompras = grupo.reduce((acc, c) => acc + c.qtd_compras, 0);
    const somaTicket = grupo.reduce((acc, c) => acc + c.ticket_medio, 0);

    return {
      faixa,
      rotulo,
      quantidade: qtd,
      porcentagem: Math.round((qtd / total) * 100),
      frequenciaMedia: qtd > 0 ? Math.round((somaCompras / qtd) * 10) / 10 : 0,
      ticketMedio: qtd > 0 ? Math.round((somaTicket / qtd) * 100) / 100 : 0,
    };
  });
}

/**
 * Gera distribuição de Frequência de Visitas.
 */
export function calcularDistribuicaoFrequencia(
  clientes: Cliente[]
): DistribuicaoFrequencia[] {
  const faixas: { faixa: FaixaFrequencia; rotulo: string }[] = [
    { faixa: "1_visita", rotulo: "1 Visita (Novos)" },
    { faixa: "2_4_visitas", rotulo: "2 a 4 Visitas (Ocasionais)" },
    { faixa: "5_9_visitas", rotulo: "5 a 9 Visitas (Frequentes)" },
    { faixa: "10_mais", rotulo: "10+ Visitas (Leais/VIP)" },
  ];

  const total = clientes.length || 1;

  return faixas.map(({ faixa, rotulo }) => {
    const grupo = clientes.filter(
      (c) => getFaixaFrequencia(c.qtd_compras) === faixa
    );
    const qtd = grupo.length;
    const somaLtv = grupo.reduce((acc, c) => acc + c.ltv, 0);

    return {
      faixa,
      rotulo,
      quantidade: qtd,
      porcentagem: Math.round((qtd / total) * 100),
      gastoMedio: qtd > 0 ? Math.round((somaLtv / qtd) * 100) / 100 : 0,
    };
  });
}

/**
 * Gera recomendações automáticas de campanhas otimizadas com base nos dados do público.
 */
export function gerarCampanhasOtimizadas(
  clientes: Cliente[]
): CampanhaRecomendada[] {
  const metricas = calcularMetricasPublico(clientes);
  const etarias = calcularDistribuicaoEtaria(clientes);
  const faixaDominante = [...etarias].sort((a, b) => b.quantidade - a.quantidade)[0];

  const emRisco = clientes.filter((c) => {
    if (!c.ultima_compra_em) return false;
    const dias =
      (Date.now() - new Date(c.ultima_compra_em).getTime()) / (1000 * 60 * 60 * 24);
    return dias >= 15 && c.qtd_compras >= 2;
  });

  const leais = clientes.filter((c) => c.qtd_compras >= 5);

  const campanhas: CampanhaRecomendada[] = [];

  if (faixaDominante && faixaDominante.quantidade > 0) {
    campanhas.push({
      id: "camp_idade_predominante",
      titulo: `Campanha Focada no Público ${faixaDominante.rotulo}`,
      publicoAlvo: `${faixaDominante.porcentagem}% do seu público está na faixa de ${faixaDominante.rotulo}`,
      descricao: `Este grupo possui frequência média de ${faixaDominante.frequenciaMedia} visitas e ticket médio de R$ ${faixaDominante.ticketMedio.toFixed(
        2
      )}. Ideal para lançamentos de produtos e combos especiais.`,
      potencialAlcance: faixaDominante.quantidade,
      sugestaoOferta: "Combo Donut Especial + Café Gelado com 15% OFF",
      canalRecomendado: "Instagram & WhatsApp",
      urgencia: "media",
    });
  }

  if (emRisco.length > 0) {
    campanhas.push({
      id: "camp_reativacao_recorrentes",
      titulo: "Reativação de Clientes Frequentes Ausentes",
      publicoAlvo: `${emRisco.length} clientes recorrentes não visitam a loja há mais de 15 dias`,
      descricao:
        "Clientes com histórico de compras que estão esfriando. Otimize sua retenção com um incentivo imediato.",
      potencialAlcance: emRisco.length,
      sugestaoOferta: "Cupom de 20% OFF válido até este domingo",
      canalRecomendado: "Disparo Automático no WhatsApp",
      urgencia: "alta",
    });
  }

  if (leais.length > 0) {
    campanhas.push({
      id: "camp_fidelizacao_vip",
      titulo: "Recompensa Exclusiva para o Top 20% Mais Frequente",
      publicoAlvo: `${leais.length} clientes possuem 5 ou mais visitas registradas`,
      descricao:
        "Engaje seus defensores de marca aumentando a frequência de visita de 4.2x para 6x no mês.",
      potencialAlcance: leais.length,
      sugestaoOferta: "Donut Glazed Grátis na compra de qualquer Bebida Quente",
      canalRecomendado: "Notificação VIP no WhatsApp",
      urgencia: "baixa",
    });
  }

  return campanhas;
}

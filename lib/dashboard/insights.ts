import { MOCK_VENDAS, MOCK_CLIENTES, getVendasByPeriodo, CANAL_LABELS, type CanalOrigem } from "@/lib/mock-data";
import { pctChange, fmt } from "./utils";

export interface Insight {
  texto: string;
  tipo: "positivo" | "neutro" | "negativo";
  icone: string;
}

export interface Tendencia {
  label: string;
  direcao: "up" | "down" | "stable";
  variacao: number;
}

export function calcInsights(): Insight[] {
  const insights: Insight[] = [];
  const v7 = getVendasByPeriodo(7);
  const v14 = getVendasByPeriodo(14).filter((v) => !v7.includes(v));

  const fat7 = v7.reduce((s, v) => s + v.valorTotal, 0);
  const fat14 = v14.reduce((s, v) => s + v.valorTotal, 0);
  const ticket7 = v7.length > 0 ? fat7 / v7.length : 0;
  const ticket14 = v14.length > 0 ? fat14 / v14.length : 0;
  const varTicket = pctChange(ticket7, ticket14);

  if (varTicket > 5) insights.push({ texto: `O ticket médio cresceu ${varTicket}% nos últimos 7 dias.`, tipo: "positivo", icone: "TrendingUp" });
  if (varTicket < -5) insights.push({ texto: `O ticket médio caiu ${Math.abs(varTicket)}% esta semana.`, tipo: "negativo", icone: "TrendingDown" });

  // Canal mais rentável
  const canalFat: Record<string, number> = {};
  v7.forEach((v) => {
    const c = MOCK_CLIENTES.find((cl) => cl.id === v.clienteId);
    if (!c) return;
    const label = CANAL_LABELS[c.canalOrigem as CanalOrigem] || "Outros";
    canalFat[label] = (canalFat[label] || 0) + v.valorTotal;
  });
  const topCanal = Object.entries(canalFat).sort(([, a], [, b]) => b - a)[0];
  if (topCanal) {
    const canalTickets: Record<string, number[]> = {};
    v7.forEach((v) => {
      const c = MOCK_CLIENTES.find((cl) => cl.id === v.clienteId);
      if (!c) return;
      const label = CANAL_LABELS[c.canalOrigem as CanalOrigem] || "Outros";
      if (!canalTickets[label]) canalTickets[label] = [];
      canalTickets[label].push(v.valorTotal);
    });
    const bestCanal = Object.entries(canalTickets).map(([label, vals]) => ({ label, avg: vals.reduce((s, v) => s + v, 0) / vals.length })).sort((a, b) => b.avg - a.avg)[0];
    if (bestCanal) {
      insights.push({ texto: `Clientes vindos do ${bestCanal.label} gastam, em média, ${fmt(bestCanal.avg)} por compra.`, tipo: "positivo", icone: "Users" });
    }
  }

  // Produto em alta
  const prod7: Record<string, number> = {};
  const prod14: Record<string, number> = {};
  v7.forEach((v) => v.itens.forEach((i) => { prod7[i.produtoNome] = (prod7[i.produtoNome] || 0) + i.quantidade; }));
  v14.forEach((v) => v.itens.forEach((i) => { prod14[i.produtoNome] = (prod14[i.produtoNome] || 0) + i.quantidade; }));
  const prodGrowth = Object.entries(prod7)
    .map(([nome, qtd]) => ({ nome, qtd, var: pctChange(qtd, prod14[nome] || 0) }))
    .filter((p) => p.var > 20)
    .sort((a, b) => b.var - a.var);
  if (prodGrowth[0]) {
    insights.push({ texto: `${prodGrowth[0].nome} aumentou ${prodGrowth[0].var}% nas vendas.`, tipo: "positivo", icone: "Trophy" });
  }

  // Dia da semana mais forte
  const dayFat: Record<number, number> = {};
  v7.forEach((v) => {
    const day = new Date(v.criadoEm).getDay();
    dayFat[day] = (dayFat[day] || 0) + v.valorTotal;
  });
  const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const topDay = Object.entries(dayFat).sort(([, a], [, b]) => b - a)[0];
  if (topDay && fat7 > 0) {
    const pct = Math.round((Number(topDay[1]) / fat7) * 100);
    insights.push({ texto: `${dias[Number(topDay[0])]} representa ${pct}% do faturamento semanal.`, tipo: "neutro", icone: "Calendar" });
  }

  // Horário de baixo movimento
  const hourCount: Record<number, number> = {};
  v7.forEach((v) => {
    const hour = parseInt(v.horario.split(":")[0]);
    hourCount[hour] = (hourCount[hour] || 0) + 1;
  });
  const lowHour = Object.entries(hourCount).sort(([, a], [, b]) => a - b)[0];
  if (lowHour) {
    insights.push({ texto: `O horário das ${lowHour[0]}h apresenta baixa movimentação.`, tipo: "negativo", icone: "Clock" });
  }

  return insights.slice(0, 6);
}

export function calcTendencias(): Tendencia[] {
  const v7 = getVendasByPeriodo(7);
  const v14 = getVendasByPeriodo(14).filter((v) => !v7.includes(v));

  const fat7 = v7.reduce((s, v) => s + v.valorTotal, 0);
  const fat14 = v14.reduce((s, v) => s + v.valorTotal, 0);
  const ticket7 = v7.length > 0 ? fat7 / v7.length : 0;
  const ticket14 = v14.length > 0 ? fat14 / v14.length : 0;

  const clientes7 = new Set(v7.map((v) => v.clienteId));
  const clientes14 = new Set(v14.map((v) => v.clienteId));
  const novos7 = [...clientes7].filter((id) => {
    const c = MOCK_CLIENTES.find((cl) => cl.id === id);
    if (!c) return false;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return new Date(c.criadoEm) >= cutoff;
  }).length;
  const novos14 = [...clientes14].filter((id) => {
    const c = MOCK_CLIENTES.find((cl) => cl.id === id);
    if (!c) return false;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14);
    const start = new Date(); start.setDate(start.getDate() - 7);
    return new Date(c.criadoEm) >= cutoff && new Date(c.criadoEm) < start;
  }).length;

  const cc7: Record<string, number> = {};
  v7.forEach((v) => { cc7[v.clienteId] = (cc7[v.clienteId] || 0) + 1; });
  const recorrentes7 = Object.values(cc7).filter((c) => c > 1).length;
  const cc14: Record<string, number> = {};
  v14.forEach((v) => { cc14[v.clienteId] = (cc14[v.clienteId] || 0) + 1; });
  const recorrentes14 = Object.values(cc14).filter((c) => c > 1).length;

  function dir(v: number): "up" | "down" | "stable" { return v > 3 ? "up" : v < -3 ? "down" : "stable"; }

  const varFat = pctChange(fat7, fat14);
  const varTicket = pctChange(ticket7, ticket14);
  const varNovos = pctChange(novos7, novos14);
  const varRec = pctChange(recorrentes7, recorrentes14);
  const varVendas = pctChange(v7.length, v14.length);

  return [
    { label: "Faturamento", direcao: dir(varFat), variacao: varFat },
    { label: "Ticket médio", direcao: dir(varTicket), variacao: varTicket },
    { label: "Clientes novos", direcao: dir(varNovos), variacao: varNovos },
    { label: "Recorrentes", direcao: dir(varRec), variacao: varRec },
    { label: "Nº de vendas", direcao: dir(varVendas), variacao: varVendas },
  ];
}

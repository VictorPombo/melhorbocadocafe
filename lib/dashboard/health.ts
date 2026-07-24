import { MOCK_VENDAS, MOCK_CLIENTES, getVendasByPeriodo, getUltimaCompra } from "@/lib/mock-data";
import { pctChange } from "./utils";

export interface SaudeResult {
  score: number;
  nivel: "excelente" | "bom" | "atencao" | "critico";
  motivos: string[];
  variacao: number;
}

export function calcSaudeUnidade(periodo: number = 30): SaudeResult {
  const vendasAtual = getVendasByPeriodo(periodo);
  const vendasAnterior = getVendasByPeriodo(periodo * 2).filter(
    (v) => !vendasAtual.includes(v),
  );

  const fatAtual = vendasAtual.reduce((s, v) => s + v.valorTotal, 0);
  const fatAnterior = vendasAnterior.reduce((s, v) => s + v.valorTotal, 0);

  const clientesAtual = new Set(vendasAtual.map((v) => v.clienteId)).size;
  const clientesAnterior = new Set(vendasAnterior.map((v) => v.clienteId)).size;

  const ticketAtual = vendasAtual.length > 0 ? fatAtual / vendasAtual.length : 0;
  const ticketAnterior = vendasAnterior.length > 0 ? fatAnterior / vendasAnterior.length : 0;

  // Recorrentes (compraram mais de uma vez no período)
  const clienteCounts: Record<string, number> = {};
  vendasAtual.forEach((v) => { clienteCounts[v.clienteId] = (clienteCounts[v.clienteId] || 0) + 1; });
  const recorrentes = Object.values(clienteCounts).filter((c) => c > 1).length;
  const pctRecorrente = clientesAtual > 0 ? recorrentes / clientesAtual : 0;

  // Inativos (30+ dias sem compra)
  const hoje = new Date();
  const inativos = MOCK_CLIENTES.filter((c) => {
    const ult = getUltimaCompra(c.id);
    if (!ult) return true;
    return (hoje.getTime() - new Date(ult).getTime()) / 86400000 >= 30;
  }).length;
  const pctInativos = inativos / MOCK_CLIENTES.length;

  // Score components (0-100 each)
  const scoreFat = Math.min(100, 50 + pctChange(fatAtual, fatAnterior));
  const scoreClientes = Math.min(100, 50 + pctChange(clientesAtual, clientesAnterior));
  const scoreTicket = Math.min(100, 50 + pctChange(ticketAtual, ticketAnterior));
  const scoreRecorrencia = Math.min(100, pctRecorrente * 200);
  const scoreInativos = Math.max(0, 100 - pctInativos * 200);
  const scoreEvolucao = Math.min(100, 50 + pctChange(fatAtual, fatAnterior) / 2);

  const score = Math.round(
    scoreFat * 0.25 +
    scoreClientes * 0.15 +
    scoreRecorrencia * 0.20 +
    scoreTicket * 0.15 +
    scoreInativos * 0.15 +
    scoreEvolucao * 0.10,
  );

  const motivos: string[] = [];
  const varFat = pctChange(fatAtual, fatAnterior);
  const varTicket = pctChange(ticketAtual, ticketAnterior);
  const varClientes = pctChange(clientesAtual, clientesAnterior);

  if (varFat > 5) motivos.push(`Faturamento cresceu ${varFat}% no período`);
  if (varFat < -5) motivos.push(`Faturamento caiu ${Math.abs(varFat)}% no período`);
  if (varTicket > 5) motivos.push(`Ticket médio subiu ${varTicket}%`);
  if (varTicket < -5) motivos.push(`Ticket médio caiu ${Math.abs(varTicket)}%`);
  if (pctRecorrente > 0.4) motivos.push(`${Math.round(pctRecorrente * 100)}% dos clientes retornaram`);
  if (pctRecorrente < 0.2) motivos.push("Poucos clientes estão retornando");
  if (inativos > 10) motivos.push(`${inativos} clientes inativos há mais de 30 dias`);
  if (varClientes > 10) motivos.push(`Clientes ativos cresceram ${varClientes}%`);
  if (varClientes < -10) motivos.push(`Clientes ativos caíram ${Math.abs(varClientes)}%`);

  if (motivos.length === 0) motivos.push("Operação estável no período");

  const nivel = score >= 80 ? "excelente" : score >= 60 ? "bom" : score >= 40 ? "atencao" : "critico";

  return { score, nivel, motivos, variacao: varFat };
}

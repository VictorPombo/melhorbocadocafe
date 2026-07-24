import { type Venda, type Cliente, MOCK_VENDAS, MOCK_CLIENTES, MOCK_META, getVendasByPeriodo, getUltimaCompra, CANAL_LABELS, type CanalOrigem } from "@/lib/mock-data";

/** Comparação % entre dois valores */
export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Dias entre duas datas */
export function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

/** Hoje ISO */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Formata moeda */
export function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

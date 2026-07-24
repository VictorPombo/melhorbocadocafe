import { MOCK_VENDAS, MOCK_META, getVendasByPeriodo } from "@/lib/mock-data";

export interface MetaResult {
  tipo: "diaria" | "semanal" | "mensal";
  meta: number;
  atual: number;
  pct: number;
  restante: number;
  mediaNecessaria: number;
}

export function calcMeta(tipo: "diaria" | "semanal" | "mensal"): MetaResult {
  const hoje = new Date();
  let meta: number;
  let vendas;
  let diasRestantes: number;

  if (tipo === "diaria") {
    meta = MOCK_META.diaria;
    vendas = MOCK_VENDAS.filter((v) => v.criadoEm === hoje.toISOString().split("T")[0]);
    diasRestantes = 1;
  } else if (tipo === "semanal") {
    meta = MOCK_META.semanal;
    const dayOfWeek = hoje.getDay();
    const diasPassados = dayOfWeek === 0 ? 7 : dayOfWeek;
    vendas = getVendasByPeriodo(diasPassados);
    diasRestantes = Math.max(1, 7 - diasPassados);
  } else {
    meta = MOCK_META.mensal;
    const diaDoMes = hoje.getDate();
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    vendas = getVendasByPeriodo(diaDoMes);
    diasRestantes = Math.max(1, ultimoDia - diaDoMes);
  }

  const atual = vendas.reduce((s, v) => s + v.valorTotal, 0);
  const pct = Math.min(100, Math.round((atual / meta) * 100));
  const restante = Math.max(0, meta - atual);
  const mediaNecessaria = restante / diasRestantes;

  return { tipo, meta, atual, pct, restante, mediaNecessaria };
}

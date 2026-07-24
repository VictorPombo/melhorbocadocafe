import { MOCK_VENDAS, MOCK_CLIENTES, getVendasByPeriodo, getUltimaCompra } from "@/lib/mock-data";
import { fmt } from "./utils";

export interface TimelineEvent {
  data: string;
  diasAtras: number;
  icone: string;
  texto: string;
  tipo: "conquista" | "meta" | "cliente" | "produto" | "alerta";
}

export function calcTimeline(): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const hoje = new Date();
  const hojeStr = hoje.toISOString().split("T")[0];

  // Verificar cada dia recente
  for (let i = 0; i < 14; i++) {
    const dia = new Date(hoje);
    dia.setDate(dia.getDate() - i);
    const diaStr = dia.toISOString().split("T")[0];
    const vendasDia = MOCK_VENDAS.filter((v) => v.criadoEm === diaStr);
    const fatDia = vendasDia.reduce((s, v) => s + v.valorTotal, 0);

    if (vendasDia.length === 0) continue;

    // Recorde de faturamento
    const fatDiasAnteriores = Array.from({ length: 30 }, (_, j) => {
      const d = new Date(dia);
      d.setDate(d.getDate() - (j + 1));
      const ds = d.toISOString().split("T")[0];
      return MOCK_VENDAS.filter((v) => v.criadoEm === ds).reduce((s, v) => s + v.valorTotal, 0);
    });
    const maxAnterior = Math.max(...fatDiasAnteriores, 0);
    if (fatDia > maxAnterior && fatDia > 0) {
      events.push({ data: diaStr, diasAtras: i, icone: "Trophy", texto: `Recorde de faturamento: ${fmt(fatDia)}`, tipo: "conquista" });
    }

    // Meta diária atingida
    if (fatDia >= 3200) {
      events.push({ data: diaStr, diasAtras: i, icone: "Target", texto: "Meta diária atingida!", tipo: "meta" });
    }

    // Novos clientes cadastrados no dia
    const novosDia = MOCK_CLIENTES.filter((c) => c.criadoEm === diaStr);
    if (novosDia.length >= 3) {
      events.push({ data: diaStr, diasAtras: i, icone: "UserPlus", texto: `${novosDia.length} novos clientes cadastrados`, tipo: "cliente" });
    }
  }

  // Produto entrou no top 3 (comparar semana vs semana anterior)
  const v7 = getVendasByPeriodo(7);
  const v14 = getVendasByPeriodo(14).filter((v) => !v7.includes(v));
  const top7: Record<string, number> = {};
  const top14: Record<string, number> = {};
  v7.forEach((v) => v.itens.forEach((i) => { top7[i.produtoNome] = (top7[i.produtoNome] || 0) + i.quantidade; }));
  v14.forEach((v) => v.itens.forEach((i) => { top14[i.produtoNome] = (top14[i.produtoNome] || 0) + i.quantidade; }));
  const ranking7 = Object.entries(top7).sort(([, a], [, b]) => b - a).slice(0, 3).map(([n]) => n);
  const ranking14 = Object.entries(top14).sort(([, a], [, b]) => b - a).slice(0, 3).map(([n]) => n);
  const newInTop3 = ranking7.filter((n) => !ranking14.includes(n));
  if (newInTop3.length > 0) {
    events.push({ data: hojeStr, diasAtras: 0, icone: "Package", texto: `${newInTop3[0]} entrou no Top 3 mais vendidos`, tipo: "produto" });
  }

  // Cliente VIP retornou
  const clientesComMaisGasto = MOCK_CLIENTES
    .map((c) => ({ id: c.id, nome: c.nome, total: MOCK_VENDAS.filter((v) => v.clienteId === c.id).reduce((s, v) => s + v.valorTotal, 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const vendasHoje = MOCK_VENDAS.filter((v) => v.criadoEm === hojeStr);
  clientesComMaisGasto.forEach((vip) => {
    if (vendasHoje.some((v) => v.clienteId === vip.id)) {
      events.push({ data: hojeStr, diasAtras: 0, icone: "Star", texto: `Cliente VIP ${vip.nome.split(" ")[0]} visitou a loja`, tipo: "cliente" });
    }
  });

  return events.sort((a, b) => a.diasAtras - b.diasAtras).slice(0, 10);
}

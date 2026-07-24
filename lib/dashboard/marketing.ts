import { MOCK_VENDAS, MOCK_CLIENTES, getVendasByPeriodo, CANAL_LABELS, type CanalOrigem } from "@/lib/mock-data";

export interface CanalStats {
  canal: string;
  clientes: number;
  faturamento: number;
  ticketMedio: number;
  recorrencia: number; // % que voltaram mais de 1x
}

export function calcOrigemClientes(periodo: number = 90): CanalStats[] {
  const vendas = getVendasByPeriodo(periodo);
  const canalData: Record<string, { clienteIds: Set<string>; faturamento: number; vendas: number }> = {};

  vendas.forEach((v) => {
    const c = MOCK_CLIENTES.find((cl) => cl.id === v.clienteId);
    if (!c) return;
    const label = CANAL_LABELS[c.canalOrigem as CanalOrigem] || "Outros";
    if (!canalData[label]) canalData[label] = { clienteIds: new Set(), faturamento: 0, vendas: 0 };
    canalData[label].clienteIds.add(c.id);
    canalData[label].faturamento += v.valorTotal;
    canalData[label].vendas++;
  });

  return Object.entries(canalData)
    .map(([canal, data]) => {
      const clientes = data.clienteIds.size;
      const faturamento = data.faturamento;
      const ticketMedio = data.vendas > 0 ? faturamento / data.vendas : 0;

      // Recorrência: clientes com mais de 1 venda
      const clienteVendas: Record<string, number> = {};
      vendas.forEach((v) => {
        const c = MOCK_CLIENTES.find((cl) => cl.id === v.clienteId);
        if (!c || (CANAL_LABELS[c.canalOrigem as CanalOrigem] || "Outros") !== canal) return;
        clienteVendas[c.id] = (clienteVendas[c.id] || 0) + 1;
      });
      const recorrentes = Object.values(clienteVendas).filter((n) => n > 1).length;
      const recorrencia = clientes > 0 ? Math.round((recorrentes / clientes) * 100) : 0;

      return { canal, clientes, faturamento, ticketMedio, recorrencia };
    })
    .sort((a, b) => b.faturamento - a.faturamento);
}

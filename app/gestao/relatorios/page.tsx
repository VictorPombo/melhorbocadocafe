"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MOCK_CLIENTES, MOCK_VENDAS, getVendasByPeriodo, getUltimaCompra, formatCurrency, CANAL_LABELS, type CanalOrigem } from "@/lib/mock-data";

type Periodo = 7 | 30 | 90;

const COLORS = ["#e6398f", "#b51e6c", "#7d0f47", "#f472b6", "#ec4899"];

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<Periodo>(30);

  const data = useMemo(() => {
    const vendas = getVendasByPeriodo(periodo);
    const faturamento = vendas.reduce((s, v) => s + v.valorTotal, 0);
    const ticketMedio = vendas.length > 0 ? faturamento / vendas.length : 0;

    // Clientes novos vs retorno
    const clienteIds = new Set(vendas.map((v) => v.clienteId));
    const clientesNovos = [...clienteIds].filter((cid) => {
      const c = MOCK_CLIENTES.find((cl) => cl.id === cid);
      if (!c) return false;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - periodo);
      return new Date(c.criadoEm) >= cutoff;
    }).length;
    const clientesRetorno = clienteIds.size - clientesNovos;

    // Canal de origem
    const canalCount: Record<string, { clientes: number; faturamento: number }> = {};
    vendas.forEach((v) => {
      const c = MOCK_CLIENTES.find((cl) => cl.id === v.clienteId);
      if (!c) return;
      const label = CANAL_LABELS[c.canalOrigem as CanalOrigem] || "Outros";
      if (!canalCount[label]) canalCount[label] = { clientes: 0, faturamento: 0 };
      canalCount[label].faturamento += v.valorTotal;
    });
    // Count unique clients per channel
    const clientesPorCanal: Record<string, Set<string>> = {};
    vendas.forEach((v) => {
      const c = MOCK_CLIENTES.find((cl) => cl.id === v.clienteId);
      if (!c) return;
      const label = CANAL_LABELS[c.canalOrigem as CanalOrigem] || "Outros";
      if (!clientesPorCanal[label]) clientesPorCanal[label] = new Set();
      clientesPorCanal[label].add(c.id);
    });
    Object.entries(clientesPorCanal).forEach(([label, set]) => {
      if (canalCount[label]) canalCount[label].clientes = set.size;
    });

    const canalData = Object.entries(canalCount).map(([name, d]) => ({
      name,
      clientes: d.clientes,
      faturamento: d.faturamento,
    })).sort((a, b) => b.faturamento - a.faturamento);

    // Produtos mais vendidos
    const prodCount: Record<string, number> = {};
    vendas.forEach((v) =>
      v.itens.forEach((i) => {
        prodCount[i.produtoNome] = (prodCount[i.produtoNome] || 0) + i.quantidade;
      }),
    );
    const topProdutos = Object.entries(prodCount)
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 8);

    // Top clientes
    const clienteTotal: Record<string, number> = {};
    vendas.forEach((v) => {
      clienteTotal[v.clienteId] = (clienteTotal[v.clienteId] || 0) + v.valorTotal;
    });
    const topClientes = Object.entries(clienteTotal)
      .map(([id, total]) => ({
        nome: MOCK_CLIENTES.find((c) => c.id === id)?.nome || "—",
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Clientes inativos
    const hoje = new Date();
    const inativos30 = MOCK_CLIENTES.filter((c) => {
      const ultima = getUltimaCompra(c.id);
      if (!ultima) return true;
      const diff = (hoje.getTime() - new Date(ultima).getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 30;
    });

    return {
      faturamento,
      numVendas: vendas.length,
      ticketMedio,
      clientesNovos,
      clientesRetorno,
      totalClientes: clienteIds.size,
      canalData,
      topProdutos,
      topClientes,
      inativos30,
      pieData: [
        { name: "Novos", value: clientesNovos },
        { name: "Retorno", value: clientesRetorno },
      ],
    };
  }, [periodo]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
          <p className="text-gray-400 text-sm">Visão estratégica do negócio</p>
        </div>
        <div className="flex bg-white rounded-xl border border-gray-200 p-1">
          {([7, 30, 90] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                periodo === p
                  ? "bg-[#e6398f] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {p === 7 ? "7 dias" : p === 30 ? "30 dias" : "90 dias"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Faturamento", value: formatCurrency(data.faturamento), icon: "" },
          { label: "Vendas", value: String(data.numVendas), icon: "" },
          { label: "Ticket Médio", value: formatCurrency(data.ticketMedio), icon: "" },
          { label: "Clientes Ativos", value: String(data.totalClientes), icon: "" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Novos vs Retorno */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">Novos vs. Retorno</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={4} dataKey="value">
                    {data.pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#e6398f]" />
                <span className="text-sm text-gray-600">Novos: <strong>{data.clientesNovos}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#b51e6c]" />
                <span className="text-sm text-gray-600">Retorno: <strong>{data.clientesRetorno}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Faturamento por canal */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">Faturamento por Canal</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.canalData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v: number) => `R$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} width={90} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }} />
              <Bar dataKey="faturamento" fill="#e6398f" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Top produtos */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">Mais Vendidos</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {data.topProdutos.map((p, i) => (
              <div key={p.nome} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  i < 3 ? "bg-[#e6398f]/10 text-[#e6398f]" : "bg-gray-100 text-gray-400"
                }`}>
                  {i + 1}
                </span>
                <span className="text-sm text-gray-600 flex-1 truncate">{p.nome}</span>
                <span className="text-xs text-gray-400 font-medium">{p.qtd}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top clientes */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">Top Clientes</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {data.topClientes.map((c, i) => (
              <div key={c.nome} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  i < 3 ? "bg-[#e6398f]/10 text-[#e6398f]" : "bg-gray-100 text-gray-400"
                }`}>
                  {i + 1}
                </span>
                <span className="text-sm text-gray-600 flex-1 truncate">{c.nome}</span>
                <span className="text-xs text-[#e6398f] font-bold">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes inativos */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm">Inativos (30+ dias)</h3>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
              {data.inativos30.length}
            </span>
          </div>
          <div className="p-4 space-y-2.5 max-h-60 overflow-y-auto">
            {data.inativos30.slice(0, 8).map((c) => {
              const ultima = getUltimaCompra(c.id);
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-[10px] font-bold">
                    {c.nome.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">{c.nome}</p>
                    <p className="text-[10px] text-gray-400">
                      {ultima ? `Última: ${new Date(ultima).toLocaleDateString("pt-BR")}` : "Sem compras"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

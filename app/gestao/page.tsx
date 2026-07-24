"use client";

import { useMemo } from "react";
import {
  calcSaudeUnidade, calcTendencias, calcMeta,
} from "@/lib/dashboard";
import { MOCK_VENDAS, MOCK_CLIENTES, getVendasByPeriodo, formatCurrency } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Info, DollarSign, Wallet, Receipt, UserPlus, Users, UserCheck } from "lucide-react";

const NIVEL_COLORS = { excelente: "text-green-500", bom: "text-blue-500", atencao: "text-amber-500", critico: "text-red-500", inativo: "text-gray-400" };

export default function DashboardPage() {
  const data = useMemo(() => {
    const saude = calcSaudeUnidade(30);
    const tendencias = calcTendencias();
    const metaDiaria = calcMeta("diaria");
    const metaSemanal = calcMeta("semanal");
    const metaMensal = calcMeta("mensal");

    const vendasHoje = getVendasByPeriodo(1);
    const vendasMes = getVendasByPeriodo(30);
    const fatHoje = vendasHoje.reduce((s, v) => s + v.valorTotal, 0);
    const fatMes = vendasMes.reduce((s, v) => s + v.valorTotal, 0);
    const ticketMedio = vendasMes.length > 0 ? fatMes / vendasMes.length : 0;
    const clientesNovos = MOCK_CLIENTES.filter((c) => {
      const d = new Date(); d.setDate(d.getDate() - 30);
      return new Date(c.criadoEm) >= d;
    }).length;
    const clientesMes = new Set(vendasMes.map((v) => v.clienteId));
    const cc: Record<string, number> = {};
    vendasMes.forEach((v) => { cc[v.clienteId] = (cc[v.clienteId] || 0) + 1; });
    const recorrentes = Object.values(cc).filter((c) => c > 1).length;

    const produtoMaisVendidoHoje = (() => {
      const counts: Record<string, number> = {};
      vendasHoje.forEach((v) => v.itens.forEach((i) => { counts[i.produtoNome] = (counts[i.produtoNome] || 0) + i.quantidade; }));
      const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
      return sorted[0]?.[0] || "—";
    })();
    const canalDestaqueHoje = (() => {
      const canalFat: Record<string, number> = {};
      vendasHoje.forEach((v) => {
        const c = MOCK_CLIENTES.find((cl) => cl.id === v.clienteId);
        if (c) {
          const label = c.canalOrigem === "instagram" ? "Instagram" : c.canalOrigem === "google" ? "Google" : c.canalOrigem === "indicacao" ? "Indicação" : c.canalOrigem === "passou_em_frente" ? "Passou em frente" : "Outros";
          canalFat[label] = (canalFat[label] || 0) + v.valorTotal;
        }
      });
      return Object.entries(canalFat).sort(([, a], [, b]) => b - a)[0]?.[0] || "—";
    })();

    return {
      saude, tendencias,
      metaDiaria, metaSemanal, metaMensal,
      fatHoje, fatMes, ticketMedio, clientesNovos, recorrentes,
      vendasHoje: vendasHoje.length, totalClientes: clientesMes.size,
      produtoMaisVendidoHoje, canalDestaqueHoje,
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Saúde da Unidade */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={data.saude.score >= 80 ? "#22c55e" : data.saude.score >= 60 ? "#eab308" : data.saude.score >= 40 ? "#f97316" : "#ef4444"} strokeWidth="8" strokeDasharray={`${data.saude.score * 2.64} 264`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{data.saude.score}</span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold text-gray-800">Saúde da Unidade</h2>
              <span className={`text-xs font-bold uppercase ${NIVEL_COLORS[data.saude.nivel]}`}>{data.saude.nivel}</span>
            </div>
            <div className="space-y-1">
              {data.saude.motivos.map((m, i) => {
                const isPos = m.includes("cresceu") || m.includes("subiu") || m.includes("retornaram");
                const isNeg = m.includes("caiu") || m.includes("Poucos") || m.includes("inativos");
                return (
                  <p key={i} className="text-sm text-gray-500 flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">
                      {isPos ? <TrendingUp className="w-4 h-4 text-green-500" /> : isNeg ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Info className="w-4 h-4 text-blue-500" />}
                    </span>
                    {m}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Inteligente Diário */}
      <div className="bg-gradient-to-r from-[#e6398f] to-[#b51e6c] rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg"></span>
          <h2 className="text-sm font-bold opacity-90">Resumo da Unidade — Hoje</h2>
        </div>
        <p className="text-white/90 text-sm leading-relaxed">
          <strong>{data.vendasHoje} vendas</strong> · <strong>{formatCurrency(data.fatHoje)}</strong> faturados · Ticket médio <strong>{formatCurrency(data.fatHoje / Math.max(data.vendasHoje, 1))}</strong>
        </p>
        <p className="text-white/70 text-sm mt-1">
           Mais vendido: <strong>{data.produtoMaisVendidoHoje}</strong> ·  Canal: <strong>{data.canalDestaqueHoje}</strong> ·  Meta: <strong>{data.metaDiaria.pct}%</strong>
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Receita Hoje", value: formatCurrency(data.fatHoje), icon: <DollarSign className="w-5 h-5 text-green-600" /> },
          { label: "Receita do Mês", value: formatCurrency(data.fatMes), icon: <Wallet className="w-5 h-5 text-blue-600" /> },
          { label: "Ticket Médio", value: formatCurrency(data.ticketMedio), icon: <Receipt className="w-5 h-5 text-amber-600" /> },
          { label: "Novos Clientes", value: String(data.clientesNovos), icon: <UserPlus className="w-5 h-5 text-[#e6398f]" /> },
          { label: "Recorrentes", value: String(data.recorrentes), icon: <Users className="w-5 h-5 text-indigo-600" /> },
          { label: "Clientes Ativos", value: String(data.totalClientes), icon: <UserCheck className="w-5 h-5 text-emerald-600" /> },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{kpi.label}</span>
              <span className="text-base">{kpi.icon}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Metas */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4"> Metas</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[data.metaDiaria, data.metaSemanal, data.metaMensal].map((meta) => (
            <div key={meta.tipo} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 capitalize">{meta.tipo}</span>
                <span className="text-xs font-bold text-[#e6398f]">{meta.pct}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#e6398f] to-[#b51e6c] rounded-full transition-all" style={{ width: `${meta.pct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>{formatCurrency(meta.atual)}</span>
                <span>{formatCurrency(meta.meta)}</span>
              </div>
              {meta.restante > 0 && (
                <p className="text-[10px] text-gray-400">Necessário {formatCurrency(meta.mediaNecessaria)}/dia</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tendências */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-4"> Tendências <span className="text-gray-400 font-normal text-xs">7 dias vs anterior</span></h2>
        <div className="flex flex-wrap gap-3">
          {data.tendencias.map((t) => (
            <div key={t.label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50">
              <span className={`text-lg font-bold ${t.direcao === "up" ? "text-green-500" : t.direcao === "down" ? "text-red-500" : "text-gray-400"}`}>
                {t.direcao === "up" ? "↑" : t.direcao === "down" ? "↓" : "→"}
              </span>
              <span className="text-sm text-gray-700 font-medium">{t.label}</span>
              <span className={`text-xs font-bold ${t.direcao === "up" ? "text-green-500" : t.direcao === "down" ? "text-red-500" : "text-gray-400"}`}>
                {t.variacao > 0 ? "+" : ""}{t.variacao}%
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

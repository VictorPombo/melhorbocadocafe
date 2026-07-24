"use client";

import { useMemo } from "react";
import Link from "next/link";
import { calcAllScores, calcClientesRisco, calcRecuperaveis } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/mock-data";

const RISK_COLORS = { alto: "bg-red-100 text-red-600", medio: "bg-amber-100 text-amber-600", baixo: "bg-yellow-100 text-yellow-600" };
const TIER_ICONS = { ouro: "", prata: "", bronze: "" };
const NIVEL_COLORS = { excelente: "text-green-500", bom: "text-blue-500", atencao: "text-amber-500", inativo: "text-gray-400" };

export default function InteligenciaPage() {
  const data = useMemo(() => ({
    scores: calcAllScores(),
    risco: calcClientesRisco(),
    recuperaveis: calcRecuperaveis(),
  }), []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800"> Inteligência de Clientes</h1>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* VIP */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 text-sm"> Clientes VIP</h3>
          </div>
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
            {data.scores.filter((s) => s.tier).map((s) => (
              <Link key={s.cliente.id} href={`/gestao/clientes/${s.cliente.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-base">{s.tier ? TIER_ICONS[s.tier] : ""}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{s.cliente.nome}</p>
                  <p className="text-[10px] text-gray-400">{formatCurrency(s.totalGasto)} · {s.numCompras} compras</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${NIVEL_COLORS[s.nivel]}`}>
                  {s.score}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Risco */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 text-sm">️ Em Risco</h3>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{data.risco.length}</span>
          </div>
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
            {data.risco.map((r) => (
              <Link key={r.cliente.id} href={`/gestao/clientes/${r.cliente.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-xs font-bold">{r.cliente.nome[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{r.cliente.nome}</p>
                  <p className="text-[10px] text-gray-400">Última compra: há {r.diasInativo} dias · {r.freqAnterior}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_COLORS[r.nivel]}`}>{r.nivel}</span>
              </Link>
            ))}
            {data.risco.length === 0 && <p className="text-gray-400 text-sm text-center py-6">Nenhum cliente em risco</p>}
          </div>
        </div>

        {/* Recuperáveis */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 text-sm"> Recuperáveis</h3>
          </div>
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-gray-800 mb-1">{data.recuperaveis.qtd}</p>
            <p className="text-xs text-gray-400 mb-4">clientes inativos</p>
            <div className="bg-[#fdf4f9] rounded-xl p-4 mb-4">
              <p className="text-[10px] text-gray-400 mb-1">Já consumiram</p>
              <p className="text-lg font-bold text-gray-700">{formatCurrency(data.recuperaveis.totalHistorico)}</p>
              <p className="text-[10px] text-gray-400 mt-2 mb-1">Potencial de recuperação (20%)</p>
              <p className="text-xl font-bold text-[#e6398f]">{formatCurrency(data.recuperaveis.potencial20pct)}</p>
            </div>
            <Link href="/gestao/clientes" className="inline-block px-5 py-2.5 rounded-xl bg-[#e6398f] text-white text-xs font-bold hover:bg-[#b51e6c] transition-colors">
              Ver Clientes →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

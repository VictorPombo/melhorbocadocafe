"use client";

import { use } from "react";
import Link from "next/link";
import { getClienteById, getVendasByCliente, getTotalGasto, getTicketMedio, getProdutosFavoritos, formatCurrency, formatDate, CANAL_LABELS, type CanalOrigem } from "@/lib/mock-data";
import { calcScoreCliente } from "@/lib/dashboard/clientes";

const TIER_ICONS = { ouro: "", prata: "", bronze: "" };
const NIVEL_COLORS = { excelente: "text-green-500 bg-green-50", bom: "text-blue-500 bg-blue-50", atencao: "text-amber-500 bg-amber-50", inativo: "text-gray-400 bg-gray-50" };

export default function ClientePerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cliente = getClienteById(id);

  if (!cliente) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Cliente não encontrado</p>
        <Link href="/gestao/clientes" className="text-[#e6398f] text-sm mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  const vendas = getVendasByCliente(id);
  const totalGasto = getTotalGasto(id);
  const ticketMedio = getTicketMedio(id);
  const favoritos = getProdutosFavoritos(id);
  const ultimaCompra = vendas.length > 0 ? vendas[0].criadoEm : null;
  const scoreData = calcScoreCliente(id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <Link href="/gestao/clientes" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#e6398f] mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar
      </Link>

      {/* Profile header with Score */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[#e6398f]/10 flex items-center justify-center text-[#e6398f] font-bold text-lg shrink-0">
            {cliente.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">{cliente.nome}</h1>
              {scoreData.tier && <span className="text-lg">{TIER_ICONS[scoreData.tier]}</span>}
            </div>
            <p className="text-gray-400 text-sm">{cliente.telefone}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#e6398f]/10 text-[10px] font-medium text-[#e6398f]">
                {CANAL_LABELS[cliente.canalOrigem as CanalOrigem]}
              </span>
              <span className="text-[10px] text-gray-300">Cliente desde {formatDate(cliente.criadoEm)}</span>
            </div>
          </div>

          {/* Score gauge */}
          <div className="shrink-0 text-center">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={scoreData.score >= 80 ? "#22c55e" : scoreData.score >= 60 ? "#3b82f6" : scoreData.score >= 40 ? "#eab308" : "#9ca3af"} strokeWidth="8" strokeDasharray={`${scoreData.score * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800">{scoreData.score}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${NIVEL_COLORS[scoreData.nivel]}`}>{scoreData.nivel}</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total gasto", value: formatCurrency(totalGasto), color: "text-[#e6398f]" },
          { label: "Ticket médio", value: formatCurrency(ticketMedio), color: "text-gray-800" },
          { label: "Nº compras", value: String(vendas.length), color: "text-gray-800" },
          { label: "Última compra", value: ultimaCompra ? formatDate(ultimaCompra) : "—", color: "text-gray-800" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Purchase history */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">Histórico de compras</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {vendas.map((v) => (
              <div key={v.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatDate(v.criadoEm)}</span>
                    <span className="text-[10px] text-gray-300">{v.horario}</span>
                  </div>
                  <span className="text-sm font-bold text-[#e6398f]">{formatCurrency(v.valorTotal)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {v.itens.map((item, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-gray-50 text-[10px] text-gray-500 font-medium">
                      {item.quantidade}x {item.produtoNome}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {vendas.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">Nenhuma compra registrada</div>
            )}
          </div>
        </div>

        {/* Favorite products */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">Produtos favoritos</h2>
          </div>
          <div className="p-4 space-y-3">
            {favoritos.map((f, i) => (
              <div key={f.nome} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-[#e6398f]/10 text-[#e6398f]" : "bg-gray-100 text-gray-400"
                }`}>
                  {i + 1}
                </span>
                <span className="text-sm text-gray-600 flex-1 truncate">{f.nome}</span>
                <span className="text-xs text-gray-400 font-medium">{f.qtd}x</span>
              </div>
            ))}
            {favoritos.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Sem dados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

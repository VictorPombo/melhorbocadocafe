"use client";

import { useMemo } from "react";
import { calcTopProdutos, calcAssociacoes } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/mock-data";

export default function ProdutosPage() {
  const data = useMemo(() => ({
    topProdutos: calcTopProdutos(30),
    associacoes: calcAssociacoes(90),
  }), []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800"> Análise de Produtos</h1>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top vendidos */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 text-sm"> Mais Vendidos (30 dias)</h3>
          </div>
          <div className="p-4 space-y-2">
            {data.topProdutos.map((p, i) => (
              <div key={p.nome} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-[#e6398f]/10 text-[#e6398f]" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
                <span className="text-sm text-gray-600 flex-1 truncate">{p.nome}</span>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-700">{p.qtd}x</p>
                  <p className="text-[10px] text-gray-400">{formatCurrency(p.faturamento)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Associações */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 text-sm"> Comprados Juntos</h3>
          </div>
          <div className="p-4 space-y-3">
            {data.associacoes.length > 0 ? data.associacoes.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{a.produtoA}</p>
                  <p className="text-[10px] text-gray-400 my-0.5">costuma ser comprado com</p>
                  <p className="text-sm font-medium text-[#e6398f]">{a.produtoB}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-gray-700">{a.percentual}%</p>
                  <p className="text-[10px] text-gray-400">{a.qtdVendas} vendas</p>
                </div>
              </div>
            )) : <p className="text-gray-400 text-sm text-center py-6">Dados insuficientes</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

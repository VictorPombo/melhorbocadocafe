"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_CLIENTES, getTotalGasto, getUltimaCompra, getVendasByCliente, formatCurrency, formatDate, CANAL_LABELS, type CanalOrigem } from "@/lib/mock-data";

export default function ClientesPage() {
  const [busca, setBusca] = useState("");

  const filtrados = busca.length >= 1
    ? MOCK_CLIENTES.filter(
        (c) =>
          c.nome.toLowerCase().includes(busca.toLowerCase()) ||
          c.telefone.includes(busca),
      )
    : MOCK_CLIENTES;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-400 text-sm">{MOCK_CLIENTES.length} cadastrados</p>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#e6398f] bg-white outline-none transition-all text-sm text-gray-800 placeholder-gray-300"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtrados.map((cliente) => {
          const totalGasto = getTotalGasto(cliente.id);
          const ultimaCompra = getUltimaCompra(cliente.id);
          const numCompras = getVendasByCliente(cliente.id).length;

          return (
            <Link
              key={cliente.id}
              href={`/gestao/clientes/${cliente.id}`}
              className="block bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-[#e6398f]/30 hover:shadow-lg hover:shadow-[#e6398f]/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#e6398f]/10 flex items-center justify-center text-[#e6398f] font-bold text-sm shrink-0">
                  {cliente.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700 text-sm truncate group-hover:text-[#e6398f] transition-colors">
                      {cliente.nome}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-400 shrink-0">
                      {CANAL_LABELS[cliente.canalOrigem as CanalOrigem]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{cliente.telefone}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-right shrink-0">
                  <div>
                    <p className="text-xs text-gray-400">Total gasto</p>
                    <p className="text-sm font-bold text-gray-700">{formatCurrency(totalGasto)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Compras</p>
                    <p className="text-sm font-bold text-gray-700">{numCompras}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Última</p>
                    <p className="text-sm font-medium text-gray-500">{ultimaCompra ? formatDate(ultimaCompra) : "—"}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-[#e6398f] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          );
        })}
      </div>

      {filtrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Nenhum cliente encontrado para &quot;{busca}&quot;</p>
        </div>
      )}
    </div>
  );
}

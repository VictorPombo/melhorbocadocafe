"use client";

import { useState } from "react";
import { MOCK_PREMIOS } from "@/lib/fidelidade/mock-data";
import type { Premio } from "@/lib/fidelidade/types";

export default function RoletaConfigPage() {
  const [premios, setPremios] = useState<Premio[]>([...MOCK_PREMIOS]);
  const [editando, setEditando] = useState<string | null>(null);

  const totalProb = premios.reduce((s, p) => s + p.probabilidade, 0);

  function toggleAtivo(id: string) {
    setPremios((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p))
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">
          Configurar Roleta
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Defina prêmios, probabilidades e limites
        </p>
      </div>

      {/* Alerta de probabilidade */}
      {totalProb !== 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          ⚠️ A soma das probabilidades é <strong>{totalProb}%</strong> (deve ser
          100%). O sistema vai normalizar automaticamente.
        </div>
      )}

      {/* Lista de prêmios */}
      <div className="space-y-3">
        {premios.map((premio) => (
          <div
            key={premio.id}
            className={`bg-white rounded-2xl border p-5 transition-all ${
              premio.ativo ? "border-gray-100" : "border-gray-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {premio.tipo === "produto" ? "🍩" : "💰"}
                </span>
                <div>
                  <p className="font-bold text-gray-800">{premio.nome}</p>
                  <p className="text-xs text-gray-400">
                    {premio.tipo === "produto"
                      ? `Valor: R$ ${premio.valor.toFixed(2)}`
                      : `${premio.valor}% de desconto`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleAtivo(premio.id)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  premio.ativo ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    premio.ativo ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Detalhes */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Probabilidade</p>
                <p className="text-lg font-extrabold text-gray-800">
                  {premio.probabilidade}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Limite/dia</p>
                <p className="text-lg font-extrabold text-gray-800">
                  {premio.limite_diario ?? "∞"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Limite/mês</p>
                <p className="text-lg font-extrabold text-gray-800">
                  {premio.limite_mensal ?? "∞"}
                </p>
              </div>
            </div>

            {/* Barra visual da probabilidade */}
            <div className="mt-3">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e6398f] to-[#b51e6c] transition-all"
                  style={{ width: `${premio.probabilidade}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-500 mb-3">
          Distribuição visual
        </h3>
        <div className="flex h-8 rounded-lg overflow-hidden">
          {premios
            .filter((p) => p.ativo)
            .map((p, i) => {
              const cores = [
                "bg-pink-500",
                "bg-blue-500",
                "bg-green-500",
                "bg-yellow-500",
                "bg-purple-500",
                "bg-orange-500",
              ];
              return (
                <div
                  key={p.id}
                  className={`${cores[i % cores.length]} flex items-center justify-center text-[10px] text-white font-bold transition-all`}
                  style={{ width: `${(p.probabilidade / totalProb) * 100}%` }}
                  title={`${p.nome}: ${p.probabilidade}%`}
                >
                  {p.probabilidade >= 10 && `${p.probabilidade}%`}
                </div>
              );
            })}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {premios
            .filter((p) => p.ativo)
            .map((p, i) => {
              const cores = [
                "bg-pink-500",
                "bg-blue-500",
                "bg-green-500",
                "bg-yellow-500",
                "bg-purple-500",
                "bg-orange-500",
              ];
              return (
                <div key={p.id} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${cores[i % cores.length]}`} />
                  <span className="text-xs text-gray-500">{p.nome}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

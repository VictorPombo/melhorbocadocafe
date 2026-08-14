"use client";

import { useState, useEffect } from "react";

export default function HistoricoPage() {
  const [historico, setHistorico] = useState<
    {
      id: string;
      cliente: string;
      whatsapp: string;
      premio: string;
      cupom: string;
      status: string;
      data: string;
      unidade: string;
    }[]
  >([]);
  const [filtro, setFiltro] = useState<"todos" | "disponivel" | "utilizado" | "expirado">("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("/api/fidelidade/metricas")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.historicoCompleto)) {
          setHistorico(data.historicoCompleto);
        }
      })
      .catch(() => {});
  }, []);

  const filtrados = historico.filter((g) => {
    if (filtro !== "todos" && g.status !== filtro) return false;
    if (busca) {
      const term = busca.toLowerCase();
      return (
        g.cliente.toLowerCase().includes(term) ||
        g.cupom.toLowerCase().includes(term) ||
        g.premio.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "utilizado":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-600">
            Utilizado
          </span>
        );
      case "disponivel":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600">
            Ativo
          </span>
        );
      case "expirado":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-500">
            Expirado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">
          Histórico de Giros
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Quem ganhou, quando, qual prêmio, se usou
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, cupom ou prêmio..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#e6398f]"
        />
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["todos", "disponivel", "utilizado", "expirado"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filtro === f
                  ? "bg-white text-[#e6398f] shadow-sm"
                  : "text-gray-400"
              }`}
            >
              {f === "todos" ? "Todos" : f === "disponivel" ? "Ativos" : f === "utilizado" ? "Usados" : "Expirados"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase">
                  Cliente
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase">
                  Prêmio
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase">
                  Cupom
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((giro) => (
                <tr
                  key={giro.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-all"
                >
                  <td className="px-5 py-3">
                    <p className="font-bold text-gray-800">{giro.cliente}</p>
                    <p className="text-xs text-gray-400">{giro.unidade} • {giro.whatsapp}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{giro.premio}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono font-bold text-gray-700">
                      {giro.cupom}
                    </span>
                  </td>
                  <td className="px-5 py-3">{statusBadge(giro.status)}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {giro.data}
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-300"
                  >
                    Nenhum giro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

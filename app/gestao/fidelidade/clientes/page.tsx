"use client";

import { useState, useEffect } from "react";
import type { Cliente } from "@/lib/fidelidade/types";
import { useRouter } from "next/navigation";

export default function ClientesFidelidadePage() {
  const router = useRouter();
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "vip" | "risco" | "novos">(
    "todos"
  );

  useEffect(() => {
    fetch("/api/fidelidade/metricas")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.clientes)) {
          setListaClientes(data.clientes);
        }
      })
      .catch(() => {});
  }, []);

  const agora = new Date();
  const quinzeDiasAtras = new Date(agora.getTime() - 15 * 24 * 60 * 60 * 1000);
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

  const clientes = listaClientes.filter((c) => {
    // Filtro por busca
    if (busca) {
      const term = busca.toLowerCase();
      if (
        !c.nome.toLowerCase().includes(term) &&
        !(c.whatsapp || "").includes(term)
      )
        return false;
    }

    // Filtro por segmento
    if (filtro === "vip") return c.vip;
    if (filtro === "risco") {
      return (
        c.ultima_compra_em &&
        new Date(c.ultima_compra_em) < quinzeDiasAtras &&
        c.qtd_compras >= 2
      );
    }
    if (filtro === "novos") {
      return new Date(c.criado_em) > seteDiasAtras;
    }
    return true;
  }).sort((a, b) => b.total_gasto - a.total_gasto);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">
          Clientes Fidelidade
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {listaClientes.length} {listaClientes.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou WhatsApp..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#e6398f]"
        />
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["todos", "vip", "risco", "novos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filtro === f
                  ? "bg-white text-[#e6398f] shadow-sm"
                  : "text-gray-400"
              }`}
            >
              {f === "todos"
                ? "Todos"
                : f === "vip"
                ? "👑 VIP"
                : f === "risco"
                ? "⚠️ Risco"
                : "🆕 Novos"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista ou Estado Vazio */}
      {clientes.length > 0 ? (
        <div className="space-y-2">
          {clientes.map((cliente) => {
            const diasSemCompra = cliente.ultima_compra_em
              ? Math.floor(
                  (agora.getTime() -
                    new Date(cliente.ultima_compra_em).getTime()) /
                    (24 * 60 * 60 * 1000)
                )
              : null;
            const emRisco =
              diasSemCompra !== null &&
              diasSemCompra > 15 &&
              cliente.qtd_compras >= 2;

            return (
              <div
                key={cliente.id}
                onClick={() => router.push(`/gestao/clientes/${cliente.id}`)}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e6398f] to-[#5c2d16] text-white flex items-center justify-center font-bold text-sm">
                    {cliente.nome.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">
                        {cliente.nome}
                      </span>
                      {cliente.vip && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                          VIP
                        </span>
                      )}
                      {emRisco && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                          Em Risco
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {cliente.whatsapp || cliente.celular || "Sem WhatsApp"} • {cliente.qtd_compras}{" "}
                      {cliente.qtd_compras === 1 ? "giro" : "giros"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-4xl mb-2">👥</p>
          <p className="text-sm font-bold text-gray-700">Nenhum cliente cadastrado ainda</p>
          <p className="text-xs text-gray-400 mt-1">Conforme os clientes giram a roleta no balcão, os cadastros reais aparecerão aqui.</p>
        </div>
      )}
    </div>
  );
}

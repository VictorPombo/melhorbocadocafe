"use client";

import { useState } from "react";
import { MOCK_CLIENTES_FIDELIDADE } from "@/lib/fidelidade/mock-data";
import { useRouter } from "next/navigation";

// Clientes expandidos com dados estratégicos
const CLIENTES_ENRIQUECIDOS = [
  ...MOCK_CLIENTES_FIDELIDADE,
  {
    id: "cli_4",
    nome: "Carlos Lima",
    whatsapp: "31999990004",
    nascimento: "1988-11-10",
    canal_aquisicao: "instagram" as const,
    aceite_lgpd: true,
    aceite_lgpd_em: "2026-06-20T10:00:00Z",
    aceite_lgpd_texto_versao: "1.0",
    criado_em: "2026-06-20T10:00:00Z",
    primeira_compra_em: "2026-06-21T10:00:00Z",
    ultima_compra_em: "2026-07-14T10:00:00Z",
    total_gasto: 312.5,
    ticket_medio: 31.25,
    qtd_compras: 10,
    loja_preferida: "loja_1",
    horario_preferido: "15:00",
    ltv: 312.5,
    vip: true,
  },
  {
    id: "cli_5",
    nome: "Fernanda Costa",
    whatsapp: "31999990005",
    nascimento: "1992-08-25",
    canal_aquisicao: "tiktok" as const,
    aceite_lgpd: true,
    aceite_lgpd_em: "2026-07-01T10:00:00Z",
    aceite_lgpd_texto_versao: "1.0",
    criado_em: "2026-07-01T10:00:00Z",
    primeira_compra_em: "2026-07-02T10:00:00Z",
    ultima_compra_em: "2026-07-12T10:00:00Z",
    total_gasto: 156.8,
    ticket_medio: 26.13,
    qtd_compras: 6,
    loja_preferida: "loja_1",
    horario_preferido: "10:00",
    ltv: 156.8,
    vip: false,
  },
];

export default function ClientesFidelidadePage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "vip" | "risco" | "novos">(
    "todos"
  );

  const agora = new Date();
  const quinzeDiasAtras = new Date(agora.getTime() - 15 * 24 * 60 * 60 * 1000);
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

  const clientes = CLIENTES_ENRIQUECIDOS.filter((c) => {
    // Filtro por busca
    if (busca) {
      const term = busca.toLowerCase();
      if (
        !c.nome.toLowerCase().includes(term) &&
        !c.whatsapp.includes(term)
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
          {CLIENTES_ENRIQUECIDOS.length} clientes cadastrados
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

      {/* Lista */}
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
              className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-all cursor-pointer ${
                emRisco ? "border-red-200" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    cliente.vip
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                      : "bg-gradient-to-br from-gray-300 to-gray-400"
                  }`}
                >
                  {cliente.nome.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 truncate">
                      {cliente.nome}
                    </p>
                    {cliente.vip && <span className="text-xs">👑</span>}
                    {emRisco && <span className="text-xs">⚠️</span>}
                  </div>
                  <p className="text-xs text-gray-400">
                    {cliente.qtd_compras} compras • Ticket R${" "}
                    {cliente.ticket_medio.toFixed(2)}
                  </p>
                </div>

                {/* Métricas */}
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-extrabold text-gray-800">
                    R$ {cliente.total_gasto.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {diasSemCompra !== null
                      ? diasSemCompra === 0
                        ? "Comprou hoje"
                        : `${diasSemCompra}d sem comprar`
                      : "Sem compras"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {clientes.length === 0 && (
          <div className="text-center py-12 text-gray-300">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import type { Cliente } from "@/lib/fidelidade/types";
import { UNIDADES_LOJA } from "@/lib/fidelidade/types";
import { Users, Search, Store, Cake, Phone, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClientesFidelidadePage() {
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "vip" | "recorrentes" | "novos">("todos");
  const [userRole, setUserRole] = useState<string>("admin");
  const [userUnidadeId, setUserUnidadeId] = useState<string>("todas");
  const [userUnidadeNome, setUserUnidadeNome] = useState<string>("Rede Consolidada");
  const [lojaSelecionada, setLojaSelecionada] = useState<string>("todas");

  useEffect(() => {
    const role = localStorage.getItem("mb_role") || "admin";
    const unidId = localStorage.getItem("mb_unidade_id") || "todas";
    const unidNome = localStorage.getItem("mb_unidade_nome") || "Rede Consolidada";
    setUserRole(role);
    setUserUnidadeId(unidId);
    setUserUnidadeNome(unidNome);

    if (role === "franquia" && unidId && unidId !== "todas") {
      setLojaSelecionada(unidId);
    }

    fetch("/api/fidelidade/metricas")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.clientes)) {
          setListaClientes(data.clientes);
        }
      })
      .catch(() => {});
  }, []);

  const clientesFiltradosPorLoja = listaClientes.filter((c) => {
    if (userRole === "franquia" && userUnidadeId && userUnidadeId !== "todas") {
      const u = (c.loja_preferida || c.unidade_cadastro || "").toLowerCase();
      return u === userUnidadeId.toLowerCase() || u.includes(userUnidadeId.toLowerCase());
    }
    if (lojaSelecionada !== "todas") {
      const u = (c.loja_preferida || c.unidade_cadastro || "").toLowerCase();
      return u === lojaSelecionada.toLowerCase() || u.includes(lojaSelecionada.toLowerCase());
    }
    return true;
  });

  const clientes = clientesFiltradosPorLoja
    .filter((c) => {
      if (busca) {
        const term = busca.toLowerCase();
        const nomeMatch = c.nome.toLowerCase().includes(term);
        const zapMatch = (c.whatsapp || c.celular || "").includes(term);
        if (!nomeMatch && !zapMatch) return false;
      }

      if (filtro === "vip") return c.vip || c.qtd_compras >= 5;
      if (filtro === "recorrentes") return c.qtd_compras >= 2;
      if (filtro === "novos") return c.qtd_compras === 1;

      return true;
    })
    .sort((a, b) => b.qtd_compras - a.qtd_compras);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/gestao/fidelidade"
              className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-[#e6398f]" />
              <span>Base de Clientes da Roleta</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {userRole === "franquia"
              ? `Unidade ${userUnidadeNome} • ${clientesFiltradosPorLoja.length} clientes cadastrados no balcão`
              : `Rede Consolidada • ${clientesFiltradosPorLoja.length} clientes cadastrados`}
          </p>
        </div>

        {/* Seletor de Loja (Exclusivo Admin) */}
        {userRole === "admin" && (
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-200 shadow-xs">
            <Store className="w-4 h-4 text-amber-500" />
            <select
              value={lojaSelecionada}
              onChange={(e) => setLojaSelecionada(e.target.value)}
              className="bg-transparent text-xs font-black text-gray-800 outline-none cursor-pointer"
            >
              <option value="todas">🌐 Todas as Lojas</option>
              {UNIDADES_LOJA.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou celular/WhatsApp..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-xs sm:text-sm font-bold text-gray-800 outline-none focus:border-[#e6398f] shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 bg-gray-100/90 rounded-2xl p-1 shrink-0 overflow-x-auto">
          {(
            [
              { id: "todos", label: "Todos" },
              { id: "vip", label: "👑 VIP (5+)" },
              { id: "recorrentes", label: "🔄 Recorrentes (2+)" },
              { id: "novos", label: "✨ 1ª Visita" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltro(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                filtro === item.id
                  ? "bg-white text-[#e6398f] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Clientes */}
      {clientes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {clientes.map((c) => {
            const lojaNome =
              UNIDADES_LOJA.find((u) => u.id === (c.loja_preferida || c.unidade_cadastro))?.nome ||
              c.loja_preferida ||
              "Tatuapé";

            return (
              <div
                key={c.id}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#e6398f] to-amber-400 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                      {c.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-gray-900 truncate">
                        {c.nome}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#e6398f]" />
                        <span>{c.whatsapp || c.celular || "Sem número"}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      c.qtd_compras >= 5
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : c.qtd_compras >= 2
                        ? "bg-pink-100 text-[#e6398f]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.qtd_compras} {c.qtd_compras === 1 ? "Visita" : "Visitas"}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-bold">
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <Store className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{lojaNome}</span>
                  </span>

                  {c.nascimento ? (
                    <span className="flex items-center gap-1 text-gray-600">
                      <Cake className="w-3 h-3 text-pink-500" />
                      <span>{c.nascimento}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Nascimento N/I</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 space-y-2">
          <div className="w-14 h-14 rounded-full bg-pink-50 text-[#e6398f] flex items-center justify-center text-2xl mx-auto">
            👥
          </div>
          <h3 className="text-sm font-black text-gray-800">
            Nenhum cliente cadastrado nesta unidade ainda
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Conforme os clientes escaneiam o QR Code e giram a roleta no balcão, os registros aparecerão aqui em tempo real.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import type { Cliente } from "@/lib/fidelidade/types";
import { UNIDADES_LOJA } from "@/lib/fidelidade/types";
import {
  Users,
  Search,
  Store,
  Cake,
  Phone,
  Calendar,
  ArrowLeft,
  X,
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface CupomHistorico {
  id: string;
  codigo_cupom: string;
  premio_id: string;
  premio: {
    id: string;
    nome: string;
    tipo: string;
    valor: number;
    icone: string;
    cor_fatia?: string;
  };
  cliente_nome: string;
  cliente_whatsapp: string;
  unidade: string;
  visita_numero: number;
  origem_cupom?: string;
  status: "disponivel" | "utilizado" | "expirado";
  criado_em: string;
  expira_em: string;
  utilizado_em: string | null;
  utilizado_unidade?: string | null;
}

export default function ClientesFidelidadePage() {
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "vip" | "recorrentes" | "novos">("todos");
  const [userRole, setUserRole] = useState<string>("admin");
  const [userUnidadeId, setUserUnidadeId] = useState<string>("todas");
  const [userUnidadeNome, setUserUnidadeNome] = useState<string>("Rede Consolidada");
  const [lojaSelecionada, setLojaSelecionada] = useState<string>("todas");

  // Estados do Modal de Histórico de Visitas do Cliente
  const [clienteModal, setClienteModal] = useState<Cliente | null>(null);
  const [historicoCupons, setHistoricoCupons] = useState<CupomHistorico[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [copiadoCodigo, setCopiadoCodigo] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("mb_role") || "admin";
    const unidId = localStorage.getItem("mb_unidade_id") || "todas";
    const unidNome = localStorage.getItem("mb_unidade_nome") || "Rede Consolidada";
    setUserRole(role);
    setUserUnidadeId(unidId);
    setUserUnidadeNome(unidNome);

    if (role === "franquia" && unidId && unidId !== "todas") {
      setLojaSelecionada(unidId);
    } else if (unidId && unidId !== "todas") {
      setLojaSelecionada(unidId);
    }

    function recarregarMetricas() {
      fetch("/api/fidelidade/metricas")
        .then((res) => res.json())
        .then((data) => {
          if (data.sucesso && Array.isArray(data.clientes)) {
            setListaClientes(data.clientes);
          }
        })
        .catch(() => {});
    }

    recarregarMetricas();

    function handleLojaEvent(e: any) {
      if (e.detail?.id) {
        setLojaSelecionada(e.detail.id);
        setUserUnidadeId(e.detail.id);
        setUserUnidadeNome(e.detail.nome || "Rede Consolidada");
      }
    }

    window.addEventListener("mb_loja_changed", handleLojaEvent);
    return () => window.removeEventListener("mb_loja_changed", handleLojaEvent);
  }, []);

  function handleAbrirCliente(c: Cliente) {
    setClienteModal(c);
    setCarregandoHistorico(true);
    setHistoricoCupons([]);

    const zapClean = (c.whatsapp || c.celular || "").replace(/\D/g, "");
    fetch(`/api/fidelidade/cupons?whatsapp=${zapClean}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.cupons)) {
          // Ordena por visita_numero ascendente (1ª, 2ª, 3ª...) ou data
          const ordenados = [...data.cupons].sort((a: CupomHistorico, b: CupomHistorico) => {
            if (a.visita_numero !== b.visita_numero) {
              return a.visita_numero - b.visita_numero;
            }
            return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
          });
          setHistoricoCupons(ordenados);
        } else {
          setHistoricoCupons([]);
        }
      })
      .catch(() => {
        setHistoricoCupons([]);
      })
      .finally(() => {
        setCarregandoHistorico(false);
      });
  }

  function handleCopiarCodigo(codigo: string) {
    navigator.clipboard.writeText(codigo);
    setCopiadoCodigo(codigo);
    setTimeout(() => setCopiadoCodigo(null), 2500);
  }

  function formatarDataHora(isoString?: string | null) {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return isoString || "—";
    }
  }

  function formatarDataSimples(isoString?: string | null) {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString("pt-BR");
    } catch {
      return isoString || "—";
    }
  }

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
              : lojaSelecionada !== "todas"
              ? `Unidade ${
                  UNIDADES_LOJA.find((u) => u.id === lojaSelecionada)?.nome || lojaSelecionada
                } • ${clientesFiltradosPorLoja.length} clientes cadastrados`
              : `Rede Consolidada (Todas as Lojas) • ${clientesFiltradosPorLoja.length} clientes cadastrados`}
          </p>
        </div>

        {/* Seletor de Loja (Exclusivo Admin) */}
        {userRole === "admin" && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-gray-200 shadow-xs">
            <Store className="w-4 h-4 text-amber-500" />
            <select
              value={lojaSelecionada}
              onChange={(e) => {
                const novoId = e.target.value;
                setLojaSelecionada(novoId);
                let novoNome = "Rede Consolidada";
                if (novoId !== "todas") {
                  const achou = UNIDADES_LOJA.find((u) => u.id === novoId);
                  if (achou) novoNome = achou.nome;
                }
                localStorage.setItem("mb_unidade_id", novoId);
                localStorage.setItem("mb_unidade_nome", novoNome);
                window.dispatchEvent(
                  new CustomEvent("mb_loja_changed", { detail: { id: novoId, nome: novoNome } })
                );
              }}
              className="bg-transparent text-xs font-black text-gray-800 outline-none cursor-pointer"
            >
              <option value="todas">🌐 Todas as Lojas (GERAL)</option>
              {UNIDADES_LOJA.map((u) => (
                <option key={u.id} value={u.id}>
                  📍 {u.nome}
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

      {/* Lista de Cards de Clientes Interativos */}
      {clientes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map((c) => {
            const lojaNome =
              UNIDADES_LOJA.find((u) => u.id === (c.loja_preferida || c.unidade_cadastro))?.nome ||
              c.loja_preferida ||
              "Tatuapé";

            return (
              <div
                key={c.id}
                onClick={() => handleAbrirCliente(c)}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-pink-300 transition-all space-y-3 cursor-pointer active:scale-[0.99] group relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#e6398f] to-amber-400 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      {c.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-gray-900 truncate group-hover:text-[#e6398f] transition-colors">
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

                {/* Dica de Clique para Ver Histórico */}
                <div className="pt-1 flex items-center justify-end">
                  <span className="text-[10px] font-black text-[#e6398f] opacity-80 group-hover:opacity-100 flex items-center gap-1">
                    <span>Ver visitas & cupons</span>
                    <span>→</span>
                  </span>
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

      {/* ========================================================================= */}
      {/* MODAL: HISTÓRICO COMPLETO DE VISITAS DO CLIENTE */}
      {/* ========================================================================= */}
      {clienteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-pink-100 overflow-hidden">
            {/* Topo do Modal */}
            <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50/60 via-amber-50/40 to-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#e6398f] to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                  {clienteModal.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 truncate">
                      {clienteModal.nome}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        clienteModal.qtd_compras >= 5
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : clienteModal.qtd_compras >= 2
                          ? "bg-pink-100 text-[#e6398f]"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {clienteModal.qtd_compras}{" "}
                      {clienteModal.qtd_compras === 1 ? "Visita no Total" : "Visitas no Total"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5 flex-wrap">
                    <a
                      href={`https://wa.me/55${(clienteModal.whatsapp || "").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#e6398f] hover:underline font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{clienteModal.whatsapp || "Sem número"}</span>
                    </a>

                    {clienteModal.nascimento && (
                      <span className="flex items-center gap-1 font-medium text-gray-500">
                        <Cake className="w-3.5 h-3.5 text-pink-500" />
                        <span>Nasc: {clienteModal.nascimento}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1 font-medium text-gray-500">
                      <Store className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Unidade:{" "}
                        {UNIDADES_LOJA.find(
                          (u) =>
                            u.id ===
                            (clienteModal.loja_preferida || clienteModal.unidade_cadastro)
                        )?.nome ||
                          clienteModal.loja_preferida ||
                          "Tatuapé"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setClienteModal(null)}
                className="p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo: Lista Detalhada das Visitas */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
                <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#e6398f]" />
                  <span>Histórico Detalhado de Visitas & Cupons</span>
                </h3>
                <span className="text-xs text-gray-500 font-bold">
                  {historicoCupons.length} {historicoCupons.length === 1 ? "registro" : "registros"}
                </span>
              </div>

              {carregandoHistorico ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-7 h-7 border-3 border-[#e6398f] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500 font-bold">Carregando histórico de visitas...</p>
                </div>
              ) : historicoCupons.length > 0 ? (
                <div className="space-y-3">
                  {historicoCupons.map((cupom, idx) => {
                    const isUtilizado = cupom.status === "utilizado";
                    const isExpirado = cupom.status === "expirado";
                    const isDisponivel = cupom.status === "disponivel";

                    const unidadeNomeFormatada =
                      UNIDADES_LOJA.find((u) => u.id === cupom.unidade)?.nome ||
                      cupom.unidade.replace(/_/g, " ").toUpperCase();

                    const unidadeResgateFormatada = cupom.utilizado_unidade
                      ? UNIDADES_LOJA.find((u) => u.id === cupom.utilizado_unidade)?.nome ||
                        cupom.utilizado_unidade.replace(/_/g, " ").toUpperCase()
                      : unidadeNomeFormatada;

                    return (
                      <div
                        key={cupom.id || idx}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                          isUtilizado
                            ? "bg-slate-50/80 border-slate-200"
                            : isDisponivel
                            ? "bg-emerald-50/40 border-emerald-200 shadow-xs"
                            : "bg-rose-50/40 border-rose-200"
                        }`}
                      >
                        {/* Linha 1: Número da Visita + Status + Data e Hora */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-200/70">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-stone-900 text-white font-black text-xs shadow-xs shrink-0">
                              {cupom.visita_numero || idx + 1}ª Visita
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                              📍 Unidade: <strong>{unidadeNomeFormatada}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isDisponivel && (
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>✦ Disponível</span>
                              </span>
                            )}
                            {isUtilizado && (
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>✓ Utilizado</span>
                              </span>
                            )}
                            {isExpirado && (
                              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>⏳ Vencido</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Linha 2: Prêmio Ganho e Código do Cupom */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* Detalhes do Prêmio */}
                          <div className="sm:col-span-7 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-xl flex items-center justify-center shadow-xs shrink-0">
                              {cupom.premio?.icone || "🎁"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                Prêmio Conquistado
                              </p>
                              <p className="font-black text-sm text-gray-900 truncate">
                                {cupom.premio?.nome || "Prêmio Fidelidade"}
                              </p>
                            </div>
                          </div>

                          {/* Código do Cupom com Cópia */}
                          <div className="sm:col-span-5 flex items-center justify-start sm:justify-end gap-2">
                            <div className="bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase">Cupom:</span>
                              <span className="font-mono font-black text-xs text-[#e6398f]">
                                {cupom.codigo_cupom}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopiarCodigo(cupom.codigo_cupom)}
                                className="p-1 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
                                title="Copiar código"
                              >
                                {copiadoCodigo === cupom.codigo_cupom ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Linha 3: Informações de Datas (Giro, Validade, Resgate) */}
                        <div className="pt-2 border-t border-gray-200/50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-medium text-gray-600">
                          <div>
                            <span className="text-gray-400 block text-[10px] font-black uppercase">
                              Data e Hora da Visita:
                            </span>
                            <span className="font-bold text-gray-800">
                              {formatarDataHora(cupom.criado_em)}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[10px] font-black uppercase">
                              Validade do Cupom:
                            </span>
                            <span
                              className={`font-bold ${
                                isExpirado ? "text-rose-600" : "text-gray-800"
                              }`}
                            >
                              Até {formatarDataSimples(cupom.expira_em)}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[10px] font-black uppercase">
                              Status do Resgate:
                            </span>
                            {isUtilizado ? (
                              <span className="font-bold text-blue-700 block">
                                Usado em {formatarDataHora(cupom.utilizado_em)} ({unidadeResgateFormatada})
                              </span>
                            ) : isDisponivel ? (
                              <span className="font-bold text-emerald-700 block">
                                Disponível para entrega no caixa
                              </span>
                            ) : (
                              <span className="font-bold text-rose-600 block">
                                Expirou sem resgate
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-1">
                  <p className="text-sm font-black text-gray-700">Nenhum cupom registrado para este cliente</p>
                  <p className="text-xs text-gray-400">
                    Os cupons e giros aparecerão aqui assim que o cliente escanear o QR Code no balcão.
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <Link
                href="/gestao/fidelidade/caixa"
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Ir para o Terminal do Caixa</span>
                <span>→</span>
              </Link>

              <button
                type="button"
                onClick={() => setClienteModal(null)}
                className="px-5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-black transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

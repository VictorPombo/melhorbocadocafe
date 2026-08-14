"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UNIDADES_LOJA } from "@/lib/fidelidade/types";

export default function CaixaFidelidadePage() {
  const [unidade, setUnidade] = useState("tatuape");
  const [cupomInput, setCupomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resgatando, setResgatando] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [sucessoMsg, setSucessoMsg] = useState("");

  const [validacaoData, setValidacaoData] = useState<{
    cupom: {
      id: string;
      codigo_cupom: string;
      status: "disponivel" | "utilizado" | "expirado";
      visita_numero?: number | null;
      cliente_nome?: string | null;
      cliente_nascimento?: string | null;
      unidade_nome: string;
      expira_em?: string;
      utilizado_em?: string | null;
    };
    premio: {
      nome: string;
      tipo: string;
      valor: number;
      icone: string;
    };
  } | null>(null);

  interface ItemResgateCaixa {
    codigo: string;
    cliente: string;
    premio: string;
    dataHora: string;
    unidadeId: string;
    unidadeNome: string;
  }

  const [todosResgates, setTodosResgates] = useState<ItemResgateCaixa[]>([]);
  const [listaUnidades, setListaUnidades] = useState(UNIDADES_LOJA);

  // Carregar histórico inicial de resgates reais e unidade logada
  useEffect(() => {
    const savedUnidade = localStorage.getItem("mb_unidade_id");
    if (savedUnidade && savedUnidade !== "todas") {
      setUnidade(savedUnidade);
    }

    fetch("/api/fidelidade/unidades")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.unidades)) {
          setListaUnidades(data.unidades);
        }
      })
      .catch(() => {});

    fetch("/api/fidelidade/metricas")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.resgatesRecentes)) {
          setTodosResgates(
            data.resgatesRecentes.map((r: any) => ({
              codigo: r.codigo,
              cliente: r.cliente,
              premio: r.premio,
              dataHora: r.dataHora || r.hora,
              unidadeId: r.unidade_id || "tatuape",
              unidadeNome: r.unidade || "Tatuapé",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Buscar dados do cupom no endpoint de validação
  async function handleBuscarCupom(e: React.FormEvent) {
    e.preventDefault();
    const cleanCode = cupomInput.trim();
    if (!cleanCode) return;

    setLoading(true);
    setErroMsg("");
    setSucessoMsg("");
    setValidacaoData(null);

    try {
      const res = await fetch(`/api/fidelidade/cupom/validar?codigo=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (!res.ok) {
        setErroMsg(data.erro || "Cupom não encontrado.");
      } else {
        setValidacaoData(data);
      }
    } catch {
      setErroMsg("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Confirmar o resgate pelo Balconista
  async function handleUsarCupom() {
    if (!validacaoData) return;

    setResgatando(true);
    setErroMsg("");

    try {
      const res = await fetch("/api/fidelidade/cupom/resgatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_cupom: validacaoData.cupom.codigo_cupom,
          balconista: `Atendente - ${unidade.toUpperCase()}`,
          unidade: unidade,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErroMsg(data.erro || "Não foi possível resgatar o cupom.");
      } else {
        setSucessoMsg(
          `✓ Prêmio "${validacaoData.premio.nome}" entregue com sucesso a ${validacaoData.cupom.cliente_nome || "Cliente"}!`
        );

        const agora = new Date();
        const dataFmt = agora.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        const horaFmt = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        // Adiciona ao histórico isolado da unidade atual
        setTodosResgates((prev) => [
          {
            codigo: validacaoData.cupom.codigo_cupom,
            cliente: validacaoData.cupom.cliente_nome || "Cliente",
            premio: validacaoData.premio.nome,
            dataHora: `${dataFmt} • ${horaFmt}`,
            unidadeId: unidade,
            unidadeNome: listaUnidades.find((u) => u.id === unidade)?.nome || unidade,
          },
          ...prev.filter((p) => p.codigo !== validacaoData.cupom.codigo_cupom),
        ]);

        setValidacaoData(null);
        setCupomInput("");
      }
    } catch {
      setErroMsg("Erro ao processar resgate. Tente novamente.");
    } finally {
      setResgatando(false);
    }
  }

  function handleSair() {
    localStorage.removeItem("mb_auth");
    localStorage.removeItem("mb_role");
    localStorage.removeItem("mb_unidade_id");
    localStorage.removeItem("mb_unidade_nome");
    localStorage.removeItem("mb_caixa");
    window.location.href = "/gestao/login";
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col relative font-sans">
      {/* Header do Caixa / Terminal */}
      <header className="px-6 py-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍩</span>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight">
              Terminal do Balconista — Resgate de Cupons
            </h1>
            <p className="text-xs text-stone-400">Melhor Bocado Fidelidade</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Seletor de Unidade Ativa */}
          <div className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
            <span className="text-xs text-stone-400 font-bold">Unidade:</span>
            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="bg-transparent text-amber-400 font-extrabold text-xs outline-none cursor-pointer"
            >
              {listaUnidades.map((u) => (
                <option key={u.id} value={u.id} className="bg-stone-900 text-white">
                  {u.nome}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/gestao/fidelidade"
            className="px-3.5 py-1.5 bg-[#e6398f]/20 hover:bg-[#e6398f]/30 text-pink-300 text-xs font-extrabold rounded-xl border border-pink-500/30 transition-all flex items-center gap-1.5"
          >
            <span>← Painel de Gestão</span>
          </Link>

          <button
            onClick={handleSair}
            className="px-3 py-1.5 bg-stone-800 text-stone-400 text-xs font-bold rounded-lg hover:bg-stone-700 hover:text-white transition-all"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal do Caixa */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 max-w-6xl mx-auto w-full">
        {/* Painel Esquerdo: Validação do Código */}
        <div className="flex-1 bg-stone-900/80 rounded-3xl p-8 border border-stone-800 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Digite o Código do Cliente</h2>
              <p className="text-xs text-stone-400 mt-1">
                Insira o código alfanumérico exibido no celular do cliente (ex: <span className="font-mono text-amber-300">MB-88A2</span>)
              </p>
            </div>

            <form onSubmit={handleBuscarCupom} className="flex gap-3 mb-6">
              <input
                type="text"
                value={cupomInput}
                onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                placeholder="Ex: MB-88A2"
                maxLength={10}
                className="flex-1 px-5 py-4 rounded-2xl border-2 border-stone-700 bg-stone-950 focus:border-[#e6398f] outline-none transition-all text-2xl font-mono font-bold text-white placeholder-stone-600 uppercase tracking-widest"
              />
              <button
                type="submit"
                disabled={loading || !cupomInput.trim()}
                className="px-8 py-4 rounded-2xl bg-[#e6398f] text-white font-extrabold text-base hover:bg-pink-600 transition-colors disabled:opacity-50 min-w-[120px]"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </form>

            {/* Mensagem de Erro */}
            {erroMsg && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center mb-6">
                <p className="text-red-400 font-bold text-sm">{erroMsg}</p>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {sucessoMsg && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center mb-6">
                <p className="text-green-400 font-bold text-sm">{sucessoMsg}</p>
              </div>
            )}

            {/* Resultado da Validação */}
            {validacaoData && (
              <div className="bg-stone-950 rounded-2xl p-6 border border-stone-800 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{validacaoData.premio.icone}</span>
                    <div>
                      <p className="text-xs text-stone-400 uppercase font-bold">Prêmio do Cliente</p>
                      <p className="text-lg font-black text-amber-400">{validacaoData.premio.nome}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      validacaoData.cupom.status === "disponivel"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : validacaoData.cupom.status === "utilizado"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {validacaoData.cupom.status === "disponivel"
                      ? "Disponível para Resgate"
                      : validacaoData.cupom.status === "utilizado"
                      ? "Já Utilizado"
                      : "Expirado"}
                  </span>
                </div>

                {/* Detalhes do Cliente e Visita (Apenas se o cupom estiver disponível para resgate) */}
                {validacaoData.cupom.status === "disponivel" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 bg-stone-900/60 p-4 rounded-xl text-sm">
                      <div>
                        <p className="text-xs text-stone-400">Cliente</p>
                        <p className="font-extrabold text-white text-base">{validacaoData.cupom.cliente_nome}</p>
                        {validacaoData.cupom.cliente_nascimento && (
                          <p className="text-xs text-stone-400 mt-0.5">
                            Nascimento: {validacaoData.cupom.cliente_nascimento}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-stone-400">Frequência / Visita</p>
                        <div className="inline-flex items-center gap-1 text-pink-400 font-extrabold mt-1">
                          <span>🏆</span>
                          <span>
                            {validacaoData.cupom.visita_numero === 1
                              ? "1ª Visita (Novo Cliente)"
                              : `${validacaoData.cupom.visita_numero}ª Visita`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleUsarCupom}
                      disabled={resgatando}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-lg hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98] transition-all min-h-[50px]"
                    >
                      {resgatando ? "Confirmando resgate..." : "✓ Confirmar Entrega do Prêmio no Caixa"}
                    </button>
                  </>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 text-center space-y-2">
                    <p className="text-base font-black text-yellow-400">
                      🚫 Cupom Já Utilizado Anteriormente
                    </p>
                    <p className="text-xs text-stone-300">
                      Este código já foi validado e entregue no balcão. Não é possível resgatar novamente.
                    </p>
                    {validacaoData.cupom.utilizado_em && (
                      <p className="text-[11px] font-mono text-stone-400">
                        Resgatado em: {new Date(validacaoData.cupom.utilizado_em).toLocaleDateString("pt-BR")} às {new Date(validacaoData.cupom.utilizado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                    <p className="text-[10px] text-stone-500 pt-1">
                      🔒 Por política de privacidade (LGPD), dados do cliente ficam ocultos em cupons já resgatados.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-stone-800 text-xs text-stone-500 text-center">
            Ao confirmar o resgate, a validação é computada instantaneamente no relatório gerencial.
          </div>
        </div>

        {/* Painel Direito: Histórico de Resgates Recentes do Caixa */}
        <div className="w-full lg:w-80 bg-stone-900/60 rounded-3xl p-6 border border-stone-800 flex flex-col">
          <div className="mb-4">
            <h3 className="font-extrabold text-sm text-stone-300 flex items-center justify-between">
              <span>Resgates Recentes</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-stone-400 mt-1">
              Caixa da Unidade: <strong className="text-amber-400">{listaUnidades.find(u => u.id === unidade)?.nome || "Tatuapé"}</strong>
            </p>
          </div>

          {(() => {
            const resgatesDaUnidade = todosResgates.filter(
              (item) => item.unidadeId.toLowerCase() === unidade.toLowerCase()
            );

            if (resgatesDaUnidade.length === 0) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-stone-600">
                  <span className="text-4xl mb-2">🏷️</span>
                  <p className="text-xs font-bold text-stone-400">Nenhum resgate nesta unidade</p>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Histórico 100% isolado por loja.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {resgatesDaUnidade.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-mono font-bold text-amber-300">{item.codigo}</p>
                      <p className="text-xs font-extrabold text-white">{item.cliente}</p>
                      <p className="text-[11px] text-pink-400">{item.premio}</p>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 bg-stone-900 px-2 py-1 rounded-md border border-stone-800 shrink-0">
                      {item.dataHora}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { UNIDADES_LOJA } from "@/lib/fidelidade/types";
import { Maximize2, Minimize2, X, Sparkles, ArrowLeft, LogOut, QrCode } from "lucide-react";

export default function CaixaFidelidadePage() {
  const [unidade, setUnidade] = useState("tatuape");
  const [cupomInput, setCupomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resgatando, setResgatando] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [sucessoMsg, setSucessoMsg] = useState("");
  const [telaCheia, setTelaCheia] = useState(false);

  // Listener para fechar tela cheia com ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && telaCheia) {
        setTelaCheia(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [telaCheia]);

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
  const [userRole, setUserRole] = useState<string>("admin");
  const [unidadeNome, setUnidadeNome] = useState<string>("Campo Belo");

  // Carregar histórico inicial de resgates reais e unidade logada
  useEffect(() => {
    function obterCookie(nomeCookie: string): string | null {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(^| )" + nomeCookie + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    }

    const role = localStorage.getItem("mb_role") || obterCookie("mb_role") || "admin";
    setUserRole(role);

    const savedUnidadeId = localStorage.getItem("mb_unidade_id") || obterCookie("mb_unidade_id");
    const savedUnidadeNome = localStorage.getItem("mb_unidade_nome") || obterCookie("mb_unidade_nome");

    if (savedUnidadeId && savedUnidadeId !== "todas") {
      setUnidade(savedUnidadeId);
    }
    if (savedUnidadeNome) {
      setUnidadeNome(savedUnidadeNome.replace(/\(Matriz\)/gi, "").trim());
    }

    fetch("/api/fidelidade/unidades")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.unidades)) {
          setListaUnidades(data.unidades);
          // Se tiver salvo a unidade por id, atualiza o nome
          if (savedUnidadeId) {
            const achou = data.unidades.find((u: any) => u.id === savedUnidadeId);
            if (achou) setUnidadeNome(achou.nome);
          }
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
              unidadeId: r.unidade_id || r.unidadeId || "tatuape",
              unidadeNome: r.unidade || r.unidadeNome || "Tatuapé",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const nomeDaLojaExibida =
    listaUnidades.find((u) => u.id.toLowerCase() === unidade.toLowerCase())?.nome ||
    unidadeNome ||
    "Unidade";

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
    <div
      className={`min-h-screen bg-stone-950 text-white flex flex-col font-sans transition-all ${
        telaCheia ? "fixed inset-0 z-50 overflow-y-auto" : "relative"
      }`}
    >
      {/* Header do Caixa / Terminal */}
      <header className="px-6 py-3.5 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3.5">
          <Link href="/gestao/fidelidade" className="flex items-center gap-2.5 group shrink-0" title="Melhor Bocado">
            <Image
              src="/logo.png"
              alt="Melhor Bocado Café"
              width={36}
              height={36}
              className="h-8.5 w-8.5 object-contain transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-extrabold text-sm text-stone-200 hidden md:inline-block">Melhor Bocado</span>
          </Link>

          <div className="h-6 w-[1px] bg-stone-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-white tracking-tight">
                Terminal do Balconista — Resgate de Cupons
              </h1>
              {telaCheia && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[10px] font-black uppercase tracking-wider">
                  ⛶ Kiosk Balcão
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">Melhor Bocado Fidelidade • Ponto de Atendimento</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de Unidade Ativa */}
          <div className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
            <span className="text-xs text-stone-400 font-bold">Unidade:</span>
            {userRole === "admin" ? (
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
            ) : (
              <span className="text-amber-400 font-extrabold text-xs">
                {nomeDaLojaExibida}
              </span>
            )}
          </div>

          {/* Botão Gerar Novo QR Code de Balcão */}
          <button
            type="button"
            onClick={() => {
              window.location.href = "/gestao/fidelidade?tab=qrcode";
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#e6398f] to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-md shadow-pink-500/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Ir para o Gerador de QR Code do Balcão"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Gerar QR Code</span>
          </button>

          {/* Botão de Tela Cheia / Kiosk */}
          <button
            type="button"
            onClick={() => setTelaCheia(!telaCheia)}
            className={`px-3.5 py-1.5 text-xs font-black rounded-xl border transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer ${
              telaCheia
                ? "bg-pink-600 hover:bg-pink-700 text-white border-pink-500"
                : "bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border-stone-700"
            }`}
            title={telaCheia ? "Sair da Tela Cheia (ESC)" : "Expandir Terminal para Tela Cheia (Ideal para Tablet / Monitor do Caixa)"}
          >
            {telaCheia ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-white" />
                <span>Sair Tela Cheia</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Tela Cheia</span>
              </>
            )}
          </button>

          <Link
            href="/gestao/fidelidade"
            className="px-3.5 py-1.5 bg-[#e6398f]/20 hover:bg-[#e6398f]/30 text-pink-300 text-xs font-extrabold rounded-xl border border-pink-500/30 transition-all flex items-center gap-1.5"
          >
            <span>← Painel de Gestão</span>
          </Link>

          <button
            onClick={handleSair}
            className="px-3 py-1.5 bg-stone-800 text-stone-400 text-xs font-bold rounded-lg hover:bg-stone-700 hover:text-white transition-all cursor-pointer"
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
                ) : validacaoData.cupom.status === "expirado" ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center space-y-2">
                    <p className="text-base font-black text-red-400">
                      ⏳ Cupom Expirado
                    </p>
                    <p className="text-xs text-stone-300">
                      O prazo de validade deste cupom expirou em{" "}
                      {validacaoData.cupom.expira_em
                        ? new Date(validacaoData.cupom.expira_em).toLocaleDateString("pt-BR")
                        : "data anterior"}
                      . Não é possível resgatar cupons vencidos.
                    </p>
                  </div>
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

          <div className="mt-8 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
            <span>Ao confirmar o resgate, a validação é computada instantaneamente no relatório gerencial.</span>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/gestao/fidelidade?tab=qrcode";
              }}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-stone-700 transition-all cursor-pointer shrink-0"
            >
              <QrCode className="w-3.5 h-3.5 text-[#e6398f]" />
              <span>Gerar Novo QR Code →</span>
            </button>
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
              Caixa da Unidade: <strong className="text-amber-400">{nomeDaLojaExibida}</strong>
            </p>
          </div>

          {(() => {
            const resgatesDaUnidade = todosResgates.filter(
              (item) =>
                item.unidadeId.toLowerCase() === unidade.toLowerCase() ||
                item.unidadeNome.toLowerCase() === nomeDaLojaExibida.toLowerCase() ||
                item.unidadeNome.toLowerCase().includes(unidade.toLowerCase()) ||
                unidade.toLowerCase().includes(item.unidadeId.toLowerCase())
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

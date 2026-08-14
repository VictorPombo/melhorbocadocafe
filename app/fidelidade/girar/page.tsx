"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOrCreateVisitorId } from "@/lib/fidelidade/visitor";
import { Roleta } from "@/components/fidelidade/Roleta";
import { TrilhaFidelometro } from "@/components/fidelidade/TrilhaFidelometro";
import { MOCK_PREMIOS, MOCK_TRILHA_VISITAS } from "@/lib/fidelidade/mock-data";
import { UNIDADES_LOJA, type Premio, type EtapaTrilhaVisita } from "@/lib/fidelidade/types";
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  Phone,
  User,
  Calendar,
  Store,
  Copy,
  Check,
  AlertTriangle,
  Gift,
  ArrowRight,
  Lock,
  UserCheck,
  ChevronRight,
  Trophy,
} from "lucide-react";

function GirarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parâmetros vindos do QR Code lido pelo cliente
  const codigoParam = searchParams.get("codigo") || searchParams.get("qr") || "";
  const unidadeParam = searchParams.get("unidade") || "";

  const [visitorId, setVisitorId] = useState("");
  const [codigoVinculo, setCodigoVinculo] = useState(codigoParam);

  // Etapa de Identificação:
  // "telefone": aguardando digitar o WhatsApp
  // "verificando": consultando o backend
  // "reconhecido": cliente já cadastrado (só precisa clicar para resgatar/girar)
  // "novo_cadastro": primeiro acesso (preenche nome e nascimento uma única vez)
  const [etapaIdentificacao, setEtapaIdentificacao] = useState<
    "telefone" | "verificando" | "reconhecido" | "novo_cadastro"
  >("telefone");

  // Dados do formulário
  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [unidade, setUnidade] = useState(unidadeParam || "tatuape");
  const [qtdVisitasCliente, setQtdVisitasCliente] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [girando, setGirando] = useState(false);
  const [posicaoSorteada, setPosicaoSorteada] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [bloqueioFraude, setBloqueioFraude] = useState(false);
  const [premios, setPremios] = useState<Premio[]>(MOCK_PREMIOS);
  const [trilha, setTrilha] = useState<EtapaTrilhaVisita[]>(MOCK_TRILHA_VISITAS);
  const [copiado, setCopiado] = useState(false);

  const [resultado, setResultado] = useState<{
    visita_numero: number;
    unidade: string;
    cliente_nome: string;
    cliente_whatsapp?: string;
    eh_novo_cliente?: boolean;
    modo?: "roleta" | "fixo";
    premio: { nome: string; tipo: string; valor: number; icone?: string; cor_fatia?: string };
    cupom: { id: string; codigo_cupom: string; expira_em: string };
  } | null>(null);

  // Carregar prêmios e trilha de visitas do backend
  useEffect(() => {
    fetch("/api/fidelidade/premios")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.premios)) {
          setPremios(data.premios);
        }
      })
      .catch(() => {});

    fetch("/api/fidelidade/trilha")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.trilha)) {
          setTrilha(data.trilha);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (codigoParam) {
      setCodigoVinculo(codigoParam);
    }
    if (unidadeParam) {
      setUnidade(unidadeParam);
    }

    // 1. Inicializa o ID de visitante (dispositivo)
    const vid = getOrCreateVisitorId();
    setVisitorId(vid);

    // 2. Reconhecimento automático se já salvo no dispositivo
    try {
      const savedProfile = localStorage.getItem("mb_cliente_perfil");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.whatsapp) {
          const formatted = formatarWhatsapp(parsed.whatsapp);
          setWhatsapp(formatted);
          verificarClientePorTelefone(parsed.whatsapp, parsed.nome, parsed.nascimento);
        }
      }
    } catch {
      // Ignora
    }

    // 3. Validação do QR Code se fornecido
    if (codigoParam) {
      fetch("/api/fidelidade/codigo-vinculo/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoParam, loja: unidadeParam || "tatuape" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.valido && data.motivo === "ja_utilizado") {
            setBloqueioFraude(true);
            setErro("Este QR Code já foi utilizado nesta compra. Para girar novamente, solicite um novo QR Code ao atendente em sua próxima compra.");
          }
        })
        .catch(() => {});
    }
  }, [codigoParam, unidadeParam]);

  // Consulta se o WhatsApp já possui cadastro no backend
  async function verificarClientePorTelefone(
    zapRaw: string,
    nomeFallback?: string,
    nascFallback?: string
  ) {
    const zapDigits = zapRaw.replace(/\D/g, "");
    if (zapDigits.length < 10) return;

    setEtapaIdentificacao("verificando");
    setErro("");

    try {
      const res = await fetch(`/api/fidelidade/cliente/buscar?whatsapp=${zapDigits}`);
      const data = await res.json();

      if (data.encontrado && data.cliente) {
        setNome(data.cliente.nome);
        setNascimento(data.cliente.nascimento || nascFallback || "");
        setQtdVisitasCliente((data.cliente.qtd_compras || 0) + 1);
        if (data.cliente.unidade && !unidadeParam) {
          setUnidade(data.cliente.unidade);
        }
        setEtapaIdentificacao("reconhecido");
      } else {
        if (nomeFallback) setNome(nomeFallback);
        if (nascFallback) setNascimento(nascFallback);
        setQtdVisitasCliente(1);
        setEtapaIdentificacao("novo_cadastro");
      }
    } catch {
      setQtdVisitasCliente(1);
      setEtapaIdentificacao("novo_cadastro");
    }
  }

  // Formatador universal DD/MM/AAAA para data de nascimento
  function formatarDataNascimento(val: string): string {
    const digits = val.replace(/\D/g, "").slice(0, 8);
    if (!digits) return "";
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function handleNascimentoChange(val: string) {
    const formatted = formatarDataNascimento(val);
    setNascimento(formatted);
    setErro("");
  }

  // Formatador universal (XX) XXXXX-XXXX para WhatsApp
  function formatarWhatsapp(val: string): string {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function handleWhatsappChange(val: string) {
    const formatted = formatarWhatsapp(val);
    setWhatsapp(formatted);
    setErro("");

    const digits = val.replace(/\D/g, "");
    if (digits.length < 10) {
      setEtapaIdentificacao("telefone");
    } else if (digits.length === 11) {
      verificarClientePorTelefone(digits);
    }
  }

  function handleContinuarTelefone(e: React.FormEvent) {
    e.preventDefault();
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) {
      setErro("Por favor, digite seu número de celular com DDD.");
      return;
    }
    verificarClientePorTelefone(digits);
  }

  function handleTrocarTelefone() {
    setWhatsapp("");
    setNome("");
    setNascimento("");
    setEtapaIdentificacao("telefone");
    setErro("");
    localStorage.removeItem("mb_cliente_perfil");
  }

  // Etapa atual da trilha de visitas
  const etapaAtualVisita: EtapaTrilhaVisita =
    trilha.find((t) => t.visita === (((qtdVisitasCliente - 1) % 10) + 1)) || trilha[0];

  async function handleAcaoRecompensa(e: React.FormEvent) {
    e.preventDefault();

    if (girando || loading) return;

    if (bloqueioFraude) {
      setErro("Este QR Code já foi utilizado. Solicite um novo QR Code ao atendente.");
      return;
    }

    const zapDigits = whatsapp.replace(/\D/g, "");
    if (zapDigits.length < 10) {
      setErro("Por favor, informe seu número de WhatsApp com DDD.");
      setEtapaIdentificacao("telefone");
      return;
    }

    let cleanNome = nome.trim();
    let cleanNasc = formatarDataNascimento(nascimento);

    // Se for novo cadastro, valida nome e nascimento
    if (etapaIdentificacao === "novo_cadastro") {
      if (!cleanNome || cleanNome.length < 2) {
        setErro("Por favor, informe seu nome completo.");
        return;
      }

      const digitsNasc = nascimento.replace(/\D/g, "");
      if (cleanNasc.length < 8 && digitsNasc.length < 6) {
        setErro("Por favor, preencha sua data de nascimento (Ex: 01/09/2003).");
        return;
      }
    }

    if (!cleanNome) {
      cleanNome = "Cliente Fidelidade";
    }

    if (!unidade) {
      setErro("Por favor, selecione a unidade.");
      return;
    }

    setLoading(true);
    setErro("");

    // Salva perfil no localStorage para auto-preenchimento futuro
    try {
      localStorage.setItem(
        "mb_cliente_perfil",
        JSON.stringify({
          nome: cleanNome,
          nascimento: cleanNasc,
          whatsapp: zapDigits,
          unidade,
        })
      );
    } catch {
      // Ignora
    }

    try {
      const res = await fetch("/api/fidelidade/girar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: visitorId || "vis_" + Math.random().toString(36).slice(2, 9),
          nome: cleanNome,
          nascimento: cleanNasc || "01/01/2000",
          whatsapp: zapDigits,
          unidade: unidade || "tatuape",
          codigo_vinculo: codigoVinculo || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.ja_utilizado) {
          setBloqueioFraude(true);
        }
        setErro(data.erro || "Não foi possível realizar o resgate.");
        setLoading(false);
        return;
      }

      // Se for modo Fixo Direto (sem roleta), conclui na hora!
      if (data.modo === "fixo") {
        setLoading(false);
        setResultado(data);
        try {
          sessionStorage.setItem("mb_ultimo_resultado_giro", JSON.stringify(data));
        } catch {}
        return;
      }

      // Se for modo Roleta, dispara animação da roleta
      const pos = data.premio?.posicao_roleta || 1;
      setPosicaoSorteada(pos);
      setGirando(true);

      (window as any).__resultadoRoleta = data;

      // Rola suavemente para o topo onde a roleta está girando
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Erro na recompensa:", err);
      setErro("Erro de conexão com o servidor. Tente novamente em instantes.");
      setLoading(false);
    }
  }

  const handleAnimacaoConcluida = useCallback(() => {
    setGirando(false);
    setLoading(false);
    const resData = (window as any).__resultadoRoleta;
    if (resData) {
      setResultado(resData);
      try {
        sessionStorage.setItem("mb_ultimo_resultado_giro", JSON.stringify(resData));
      } catch {
        // Ignora
      }
    }
  }, []);

  function copiarCodigo(code: string) {
    navigator.clipboard.writeText(code);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  // TELA DE VITÓRIA / RESGATE DE CUPOM
  if (resultado) {
    const unidadeObj = UNIDADES_LOJA.find((u) => u.id === resultado.unidade);

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full text-center">
        <div className="w-full bg-white rounded-3xl p-6 border-2 border-pink-100 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-300">
          <div className="text-5xl animate-bounce mb-1">
            {resultado.premio.icone || "🎉"}
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-[#e6398f] rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" /> Parabéns, {resultado.cliente_nome.split(" ")[0]}!
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {resultado.modo === "fixo" ? "Recompensa Desbloqueada!" : "Você Ganhou na Roleta:"}
            </h1>
            <p className="text-2xl font-black text-[#e6398f] mt-1">
              {resultado.premio.nome}
            </p>
          </div>

          {/* Fidelômetro com o progresso atualizado */}
          <TrilhaFidelometro trilha={trilha} visitaAtual={resultado.visita_numero} />

          {/* Card do Cupom com Código Alfanumérico */}
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 rounded-2xl p-5 border-2 border-dashed border-[#e6398f]/40 relative overflow-hidden">
            <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">
              Código do Cupom
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-mono font-black text-gray-900 tracking-wider">
                {resultado.cupom.codigo_cupom}
              </span>
              <button
                onClick={() => copiarCodigo(resultado.cupom.codigo_cupom)}
                className="p-2 rounded-xl bg-white shadow-sm hover:bg-gray-50 text-gray-700 transition-colors"
                title="Copiar código"
              >
                {copiado ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">
              Válido por 7 dias em qualquer unidade Melhor Bocado
            </p>
          </div>

          <div className="bg-stone-900 text-white rounded-2xl p-3 text-xs flex items-center justify-center gap-2">
            <Store className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-medium">
              Apresente este código no caixa da unidade <strong>{unidadeObj?.nome || "Tatuapé"}</strong> para resgatar.
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => router.push(`/fidelidade/premio/${resultado.cupom.id}`)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-black text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" /> Ver Meu Cupom Salvo
            </button>
            <button
              onClick={() => router.push("/fidelidade/meus-cupons")}
              className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
            >
              Ver todos os meus cupons
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TELA PRINCIPAL DO CLIENTE COM TRILHA + IDENTIFICAÇÃO TELEFONE-PRIMEIRO
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 max-w-xl md:max-w-2xl mx-auto w-full">
      {/* Header Compacto e Elegante */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-pink-100/90 text-[#e6398f] rounded-full text-xs font-black mb-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Clube Fidelidade & Recompensas Melhor Bocado</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Prêmios e Vantagens Exclusivas no Balcão! 🍩
        </h1>
      </div>

      {/* Indicador de Unidade / QR Code */}
      {codigoVinculo && (
        <div className="w-full bg-stone-900 text-white rounded-2xl p-2.5 px-4 my-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 truncate">
            <QrCode className="w-4 h-4 text-amber-300 shrink-0" />
            <p className="text-xs font-bold truncate">
              Balcão: <span className="text-amber-300 font-extrabold">{UNIDADES_LOJA.find((u) => u.id === unidade)?.nome || "Tatuapé"}</span>
            </p>
          </div>
          <span className="text-[11px] bg-green-500/20 text-green-300 font-extrabold px-2.5 py-0.5 rounded-full border border-green-500/30 shrink-0">
            ✓ 1 Recompensa Liberada
          </span>
        </div>
      )}

      {/* Trilha de Fidelidade / Fidelômetro (sempre visível para motivar o cliente) */}
      <TrilhaFidelometro trilha={trilha} visitaAtual={qtdVisitasCliente} />

      {/* Se a visita atual for Roleta, exibe o componente da Roleta (exclusiva da visita ou padrão) */}
      {etapaAtualVisita.modo === "roleta" && (
        <Roleta
          premios={
            etapaAtualVisita.premios_roleta && etapaAtualVisita.premios_roleta.length > 0
              ? etapaAtualVisita.premios_roleta
              : premios
          }
          posicaoSorteada={posicaoSorteada}
          girando={girando}
          onAnimacaoConcluida={handleAnimacaoConcluida}
        />
      )}

      {/* Trava Antifraude: Se o código já foi consumido */}
      {bloqueioFraude ? (
        <div className="w-full bg-red-50 rounded-3xl p-5 border-2 border-red-200 text-center shadow-lg my-3 space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-red-900">
            QR Code Já Utilizado!
          </h3>
          <p className="text-xs text-red-700 leading-relaxed font-medium">
            Este código de compra já foi utilizado para desbloquear seu prêmio. Cada compra dá direito a 1 resgate exclusivo.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push("/fidelidade/meus-cupons")}
              className="w-full py-3 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-colors shadow-md"
            >
              Ver Meus Cupons Anteriores
            </button>
          </div>
        </div>
      ) : (
        /* FLUXO INTELIGENTE: TELEFONE PRIMEIRO */
        <div className="w-full bg-white rounded-3xl p-5 border border-gray-100 shadow-xl space-y-4 my-2">
          {/* PASSO 1: DIGITAÇÃO DO TELEFONE */}
          {etapaIdentificacao === "telefone" && (
            <form onSubmit={handleContinuarTelefone} className="space-y-3">
              <div className="text-center pb-1">
                <h3 className="font-extrabold text-gray-900 text-sm flex items-center justify-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#e6398f]" /> Digite seu Celular / WhatsApp
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Identificamos sua visita para liberar seu prêmio da trilha
                </p>
              </div>

              <div>
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  value={whatsapp}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                  autoFocus
                  disabled={girando || loading}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#e6398f] bg-gray-50 text-gray-900 font-extrabold text-center text-lg outline-none transition-all placeholder-gray-300 tracking-wider"
                />
              </div>

              {erro && (
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-600 text-xs font-bold text-center">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={whatsapp.replace(/\D/g, "").length < 10}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-extrabold text-sm shadow-md shadow-pink-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* CARREGANDO VERIFICAÇÃO */}
          {etapaIdentificacao === "verificando" && (
            <div className="py-6 text-center space-y-2">
              <span className="animate-spin text-2xl inline-block">🍩</span>
              <p className="text-xs font-bold text-gray-700">Verificando sua visita no clube...</p>
            </div>
          )}

          {/* PASSO 2A: CLIENTE JÁ CADASTRADO (1 CLIQUE PARA DESBLOQUEAR / GIRAR) */}
          {etapaIdentificacao === "reconhecido" && (
            <form onSubmit={handleAcaoRecompensa} className="space-y-4">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-200 text-center relative overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-[#e6398f] flex items-center justify-center mx-auto text-lg mb-1 shadow-sm">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-black text-gray-900 text-base">
                  Olá, {nome}! 👋
                </h3>
                <p className="text-xs text-[#e6398f] font-extrabold mt-0.5">
                  {qtdVisitasCliente > 1 ? `${qtdVisitasCliente}ª Visita no Melhor Bocado` : "1ª Visita de Boas-Vindas"}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  {whatsapp}
                </p>

                <button
                  type="button"
                  onClick={handleTrocarTelefone}
                  className="text-[11px] text-gray-400 hover:text-gray-700 underline font-semibold mt-2 inline-block cursor-pointer"
                >
                  Não é você? Trocar número
                </button>
              </div>

              {erro && (
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-600 text-xs font-bold text-center">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={girando || loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] via-[#c22176] to-[#5c2d16] text-white font-black text-lg shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all disabled:opacity-60 min-h-[54px] flex items-center justify-center gap-2 cursor-pointer"
              >
                {girando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin text-xl">🍩</span> Girando a Roleta...
                  </span>
                ) : loading ? (
                  "Liberando prêmio..."
                ) : etapaAtualVisita.modo === "fixo" ? (
                  <span>Resgatar {etapaAtualVisita.premio_fixo?.nome || "Prêmio da Visita"}! 🎁</span>
                ) : (
                  <span>Girar a Roleta da Sorte! 🎰</span>
                )}
              </button>
            </form>
          )}

          {/* PASSO 2B: NOVO CLIENTE (PREENCHE NOME E NASCIMENTO 1 VEZ) */}
          {etapaIdentificacao === "novo_cadastro" && (
            <form onSubmit={handleAcaoRecompensa} className="space-y-3.5">
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold text-amber-900">
                    ✨ Primeiro Acesso ({whatsapp})
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Complete seu cadastro 1 única vez para salvar seus prêmios
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTrocarTelefone}
                  className="text-[10px] text-amber-900 font-extrabold underline hover:text-black cursor-pointer"
                >
                  Trocar
                </button>
              </div>

              {/* 1. Nome Completo */}
              <div>
                <label htmlFor="nome" className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    setErro("");
                  }}
                  placeholder="Ex: Mariana Silva"
                  required
                  autoFocus
                  disabled={girando || loading}
                  className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 focus:border-[#e6398f] bg-gray-50 text-gray-900 font-bold outline-none transition-all placeholder-gray-400 text-sm"
                />
              </div>

              {/* 2. Data de Nascimento */}
              <div>
                <label htmlFor="nascimento" className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                  Data de Nascimento *
                </label>
                <input
                  id="nascimento"
                  type="text"
                  inputMode="numeric"
                  value={nascimento}
                  onChange={(e) => handleNascimentoChange(e.target.value)}
                  onBlur={(e) => handleNascimentoChange(e.target.value)}
                  placeholder="DD/MM/AAAA (Ex: 01/09/2003)"
                  maxLength={10}
                  required
                  disabled={girando || loading}
                  className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 focus:border-[#e6398f] bg-gray-50 text-gray-900 font-bold outline-none transition-all placeholder-gray-400 text-sm"
                />
              </div>

              {/* Se acessado sem QR code direto, exibe seleção limpa */}
              {!codigoParam && !unidadeParam && (
                <div>
                  <label htmlFor="unidade" className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Unidade *
                  </label>
                  <select
                    id="unidade"
                    value={unidade}
                    onChange={(e) => {
                      setUnidade(e.target.value);
                      setErro("");
                    }}
                    disabled={girando || loading}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#e6398f] bg-gray-50 text-gray-900 font-bold outline-none transition-all text-xs"
                  >
                    {UNIDADES_LOJA.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {erro && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-600 text-xs font-bold text-center">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={girando || loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] via-[#c22176] to-[#5c2d16] text-white font-black text-lg shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all disabled:opacity-60 min-h-[54px] flex items-center justify-center gap-2 cursor-pointer"
              >
                {girando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin text-xl">🍩</span> Girando a Roleta...
                  </span>
                ) : loading ? (
                  "Concluindo cadastro..."
                ) : etapaAtualVisita.modo === "fixo" ? (
                  <span>Concluir e Resgatar {etapaAtualVisita.premio_fixo?.nome || "Prêmio"}! 🎁</span>
                ) : (
                  <span>Concluir Cadastro e Girar! 🎰</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="mt-2 text-center">
        <p className="text-[10px] text-gray-400 font-medium">
          Melhor Bocado • Trilha de Fidelidade & Roleta da Sorte • 1 Resgate por Compra
        </p>
      </div>
    </div>
  );
}

export default function GirarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
          <span className="animate-spin text-3xl mb-2">🍩</span>
          <p className="font-bold text-sm">Carregando Clube de Fidelidade...</p>
        </div>
      }
    >
      <GirarContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  RotateCw,
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
  // "reconhecido": cliente já cadastrado (1 clique para girar)
  // "novo_cadastro": primeiro acesso (preenche nome e whatsapp)
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
  const [listaUnidades, setListaUnidades] = useState<typeof UNIDADES_LOJA>(UNIDADES_LOJA);
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

  // Carregar prêmios, trilha de visitas e unidades do backend
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

    fetch("/api/fidelidade/unidades")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.unidades)) {
          setListaUnidades(data.unidades);
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
      // Checagem local instantânea
      try {
        if (localStorage.getItem(`mb_qr_utilizado_${codigoParam}`)) {
          setBloqueioFraude(true);
          setErro("Este QR Code já foi utilizado. Peça ao atendente do caixa para gerar um novo QR Code.");
        }
      } catch {}

      // Checagem remota no banco Supabase
      fetch("/api/fidelidade/codigo-vinculo/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoParam, loja: unidadeParam || "pinheiros" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.valido && data.motivo === "ja_utilizado") {
            setBloqueioFraude(true);
            setErro("Este QR Code já foi utilizado. Peça ao atendente do caixa para gerar um novo QR Code.");
            try {
              localStorage.setItem(`mb_qr_utilizado_${codigoParam}`, "true");
            } catch {}
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
    trilha.find((t) => t.visita === (((qtdVisitasCliente - 1) % Math.max(1, trilha.length)) + 1)) || trilha[0];

  // Prêmios a serem exibidos na roleta (exclusivos da visita atual ou lista padrão)
  const premiosDaRoleta =
    etapaAtualVisita?.premios_roleta && etapaAtualVisita.premios_roleta.length > 0
      ? etapaAtualVisita.premios_roleta
      : premios;

  async function handleAcaoRecompensa(e: React.FormEvent) {
    e.preventDefault();

    if (girando || loading) return;

    if (bloqueioFraude) {
      setErro("Este QR Code já foi utilizado. Peça ao atendente do caixa para gerar um novo QR Code.");
      return;
    }

    const zapDigits = whatsapp.replace(/\D/g, "");
    if (zapDigits.length < 10) {
      setErro("Por favor, informe seu número de celular / WhatsApp com DDD.");
      setEtapaIdentificacao("telefone");
      return;
    }

    let cleanNome = nome.trim();
    let cleanNasc = formatarDataNascimento(nascimento);

    // Se for novo cadastro e não digitou nome, solicita
    if (etapaIdentificacao === "novo_cadastro") {
      if (!cleanNome || cleanNome.length < 2) {
        setErro("Por favor, digite seu nome.");
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
          nascimento: cleanNasc || "01/01/2000",
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
        setErro(data.erro || "Não foi possível realizar o giro.");
        setLoading(false);
        return;
      }

      // Dispara o giro da Roleta com animação
      const pos = data.premio?.posicao_roleta || 1;
      setPosicaoSorteada(pos);
      setGirando(true);

      if (codigoVinculo) {
        try {
          localStorage.setItem(`mb_qr_utilizado_${codigoVinculo}`, "true");
        } catch {}
      }

      (window as any).__resultadoRoleta = data;

      // Rola suavemente para o topo onde a roleta está girando
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Erro na recompensa:", err);
      setErro("Erro de conexão com o servidor. Tente novamente.");
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
    const cleanKey = (resultado.unidade || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const unidadeObj = listaUnidades.find((u) => {
      const cleanId = u.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanNome = u.nome.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanId === cleanKey || cleanNome.includes(cleanKey) || cleanKey.includes(cleanId);
    }) || UNIDADES_LOJA.find((u) => u.id === resultado.unidade);

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-xl md:max-w-2xl mx-auto w-full text-center">
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-300">
          <div className="text-5xl animate-bounce mb-1">
            {resultado.premio.icone || "🎉"}
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-[#e6398f] rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" /> Parabéns, {resultado.cliente_nome.split(" ")[0]}!
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Você Ganhou na Roleta:
            </h1>
            <p className="text-2xl sm:text-3xl font-black text-[#e6398f] mt-1">
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
                className="p-2 rounded-xl bg-white shadow-sm hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
                title="Copiar código"
              >
                {copiado ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 font-medium">
              Válido por 7 dias em qualquer unidade Melhor Bocado
            </p>
          </div>

          <div className="bg-stone-900 text-white rounded-2xl p-3.5 text-xs flex items-center justify-center gap-2">
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

  // Se o cliente acessou a URL diretamente sem escanear o QR Code gerado no balcão da loja
  if (!codigoParam && !codigoVinculo) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 max-w-lg mx-auto w-full animate-fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-2xl text-center space-y-5 w-full">
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-[#e6398f] flex items-center justify-center shadow-xl shadow-pink-500/25">
            <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
              BALCÃO
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[#e6398f] text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" /> Acesso Exclusivo por QR Code
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Aponte a Câmera para o QR Code da Loja
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Para girar a <strong>Roleta de Prêmios</strong> e participar do Clube de Fidelidade Melhor Bocado, realize uma compra em uma de nossas unidades e aponte a câmera do seu celular para o <strong>QR Code na tela do caixa ou na comanda</strong>.
            </p>
          </div>

          {/* Passo a Passo Ilustrado */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-pink-100 text-[#e6398f] font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <p className="text-xs font-bold text-gray-800">
                Faça sua compra em qualquer unidade Melhor Bocado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-pink-100 text-[#e6398f] font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <p className="text-xs font-bold text-gray-800">
                Escaneie o QR Code gerado pelo atendente no caixa
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-pink-100 text-[#e6398f] font-black text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <p className="text-xs font-bold text-gray-800">
                Gire a roleta e retire seu prêmio na hora com o atendente!
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/fidelidade/meus-cupons"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e6398f] to-rose-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Ver Meus Cupons Já Ganhos</span>
            </Link>

            <Link
              href="/gestao/login"
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sou Atendente / Franquia (Gerar QR Code)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // TELA PRINCIPAL DO CLIENTE COM ROLETA + TRILHA + IDENTIFICAÇÃO
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-2.5 sm:p-4 max-w-md sm:max-w-lg mx-auto w-full overflow-x-hidden touch-pan-y">
      {/* Header Compacto e Elegante */}
      <div className="text-center mb-1 w-full">
        <div className="inline-flex items-center gap-1 px-3 py-0.5 bg-pink-100/90 text-[#e6398f] rounded-full text-[11px] font-black mb-1 shadow-2xs">
          <Sparkles className="w-3 h-3" />
          <span>Clube Fidelidade Melhor Bocado</span>
        </div>
        <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
          Prêmios e Vantagens no Balcão! 🍩
        </h1>
      </div>

      {/* Indicador de Unidade / QR Code */}
      {codigoVinculo && (
        <div className="w-full bg-stone-900 text-white rounded-2xl p-2 px-3.5 my-1.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 truncate">
            <QrCode className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <p className="text-[11px] sm:text-xs font-bold truncate">
              Balcão: <span className="text-amber-300 font-extrabold">{(() => {
                const cleanKey = (unidade || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                const encontrada = listaUnidades.find((u) => {
                  const cleanId = u.id.toLowerCase().replace(/[^a-z0-9]/g, "");
                  const cleanNome = u.nome.toLowerCase().replace(/[^a-z0-9]/g, "");
                  return cleanId === cleanKey || cleanNome.includes(cleanKey) || cleanKey.includes(cleanId);
                });
                return encontrada?.nome || (unidade ? unidade.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Melhor Bocado");
              })()}</span>
            </p>
          </div>
          <span className="text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0">
            {bloqueioFraude ? (
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">⚠️ QR Utilizado</span>
            ) : etapaIdentificacao === "telefone" || etapaIdentificacao === "verificando" ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">📱 Digite seu Celular</span>
            ) : (
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full">✓ 1 Giro Liberado</span>
            )}
          </span>
        </div>
      )}

      {/* Trilha de Fidelidade / Fidelômetro */}
      <TrilhaFidelometro
        trilha={trilha}
        visitaAtual={qtdVisitasCliente}
        identificado={etapaIdentificacao === "reconhecido" || etapaIdentificacao === "novo_cadastro"}
      />

      {/* A ROLETA DA SORTE SEMPRE VISÍVEL NO TOPO */}
      <div className="w-full py-1 sm:py-2 flex flex-col items-center justify-center">
        <Roleta
          premios={premiosDaRoleta}
          posicaoSorteada={posicaoSorteada}
          girando={girando}
          onAnimacaoConcluida={handleAnimacaoConcluida}
        />
      </div>

      {/* AVISO SE O QR CODE JÁ FOI UTILIZADO */}
      {bloqueioFraude ? (
        <div className="w-full bg-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 text-center shadow-lg my-3 space-y-3 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
            ⚠️
          </div>
          <h3 className="text-base sm:text-lg font-black text-amber-950">
            Este QR Code Já Foi Utilizado!
          </h3>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            Cada QR Code gerado no balcão dá direito a <strong>1 único giro da roleta por compra</strong>.
          </p>
          <div className="p-3 bg-white rounded-2xl border border-amber-200 text-xs font-bold text-amber-900 shadow-xs">
            👉 Por favor, <strong>peça ao atendente do caixa para gerar um novo QR Code</strong> para liberar seu próximo giro!
          </div>
          <div className="pt-1">
            <button
              onClick={() => router.push("/fidelidade/meus-cupons")}
              className="w-full py-3 bg-stone-900 text-white text-xs font-black rounded-xl hover:bg-stone-800 transition-colors shadow-md cursor-pointer"
            >
              🎁 Ver Meus Cupons Já Ganhos
            </button>
          </div>
        </div>
      ) : (
        /* FLUXO INTELIGENTE: IDENTIFICAÇÃO E GIRO DA ROLETA */
        <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl space-y-4 my-2">
          {/* PASSO 1: DIGITAÇÃO DO TELEFONE */}
          {etapaIdentificacao === "telefone" && (
            <form onSubmit={handleContinuarTelefone} className="space-y-3">
              <div className="text-center pb-1">
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center justify-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#e6398f]" /> Digite seu Celular / WhatsApp para Girar
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Identificamos sua visita e liberamos a roleta instantaneamente
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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] via-[#c22176] to-[#5c2d16] text-white font-black text-base sm:text-lg shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🎰 Girar Roleta da Sorte</span>
                <ChevronRight className="w-5 h-5" />
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

          {/* PASSO 2A: CLIENTE JÁ RECONHECIDO (1 CLIQUE PARA GIRAR) */}
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
                  "Preparando o giro..."
                ) : (
                  <span>🎰 GIRAR A ROLETA AGORA!</span>
                )}
              </button>
            </form>
          )}

          {/* PASSO 2B: NOVO CLIENTE (PREENCHE NOME 1 ÚNICA VEZ E GIRA) */}
          {etapaIdentificacao === "novo_cadastro" && (
            <form onSubmit={handleAcaoRecompensa} className="space-y-3.5">
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold text-amber-900">
                    ✨ Primeiro Acesso ({whatsapp})
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Digite seu nome para salvar seu cupom
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

              {/* Nome Completo */}
              <div>
                <label htmlFor="nome" className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                  Seu Nome *
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

              {/* Data de Nascimento (Opcional) */}
              <div>
                <label htmlFor="nascimento" className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                  Data de Nascimento (Para ganhar presentes no seu aniversário)
                </label>
                <input
                  id="nascimento"
                  type="text"
                  inputMode="numeric"
                  value={nascimento}
                  onChange={(e) => handleNascimentoChange(e.target.value)}
                  placeholder="DD/MM/AAAA (Ex: 15/08/1995)"
                  maxLength={10}
                  disabled={girando || loading}
                  className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 focus:border-[#e6398f] bg-gray-50 text-gray-900 font-bold outline-none transition-all placeholder-gray-400 text-sm"
                />
              </div>

              {erro && (
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-600 text-xs font-bold text-center">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={girando || loading || !nome.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] via-[#c22176] to-[#5c2d16] text-white font-black text-lg shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all disabled:opacity-60 min-h-[54px] flex items-center justify-center gap-2 cursor-pointer"
              >
                {girando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin text-xl">🍩</span> Girando a Roleta...
                  </span>
                ) : loading ? (
                  "Cadastrando e Girando..."
                ) : (
                  <span>🎰 GIRAR A ROLETA AGORA!</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Rodapé Informativo */}
      <p className="text-center text-gray-400 text-[11px] mt-4 font-medium">
        Melhor Bocado • Trilha de Fidelidade & Roleta da Sorte • 1 Resgate por Compra
      </p>
    </div>
  );
}

export default function FidelidadeGirarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#e6398f] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GirarContent />
    </Suspense>
  );
}

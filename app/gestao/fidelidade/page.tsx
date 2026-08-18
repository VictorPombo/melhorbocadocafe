"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Gift,
  TrendingUp,
  Target,
  BarChart2,
  Brain,
  MapPin,
  Zap,
  CheckCircle,
  Store,
  Clock,
  RotateCw,
  QrCode,
  Sliders,
  Copy,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Scale,
  Undo,
  Settings,
  Disc,
  Smartphone,
  ShoppingCart,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { UNIDADES_LOJA, type Premio, type Cliente } from "@/lib/fidelidade/types";
import { giroStore, cupomStore, clienteStore, MOCK_PREMIOS } from "@/lib/fidelidade/mock-data";
import { QrCodeSvg } from "@/components/fidelidade/QrCodeSvg";
import { Roleta } from "@/components/fidelidade/Roleta";
import { RoletaMini } from "@/components/fidelidade/RoletaMini";
import { PainelPublicoAlvo } from "@/components/gestao/PainelPublicoAlvo";

export default function FidelidadeDashboardPage() {
  const [tabAtual, setTabAtual] = useState<"geral" | "qrcode" | "premios" | "trilha" | "publico">("geral");

  // Estado das Métricas 100% Reais alimentadas pela operação
  const [metricasData, setMetricasData] = useState<{
    totalGiros: number;
    totalResgates: number;
    totalClientes: number;
    taxaResgate: number;
    metricasUnidades: { id: string; nome: string; scans: number; resgates: number; taxa: number }[];
    frequenciaVisitas: { nivel: string; qtd: number; percentual: number; cor: string }[];
    resgatesRecentes: { id: string; cliente: string; unidade: string; premio: string; codigo: string; hora: string; visita: string }[];
    clientes: Cliente[];
  }>({
    totalGiros: 0,
    totalResgates: 0,
    totalClientes: 0,
    taxaResgate: 0,
    metricasUnidades: UNIDADES_LOJA.map((u) => ({ id: u.id, nome: u.nome, scans: 0, resgates: 0, taxa: 0 })),
    frequenciaVisitas: [
      { nivel: "1ª Compra / 1º Giro", qtd: 0, percentual: 0, cor: "bg-blue-500" },
      { nivel: "2 a 4 Compras (Recorrente)", qtd: 0, percentual: 0, cor: "bg-[#e6398f]" },
      { nivel: "5 a 9 Compras (Frequente)", qtd: 0, percentual: 0, cor: "bg-purple-500" },
      { nivel: "10+ Compras (VIP / Fiel)", qtd: 0, percentual: 0, cor: "bg-amber-500" },
    ],
    resgatesRecentes: [],
    clientes: [],
  });

  // Estados de Unidades / Franquias Dinâmicas
  const [unidades, setUnidades] = useState<import("@/lib/fidelidade/types").UnidadeLoja[]>(UNIDADES_LOJA);
  const [lojaFiltro, setLojaFiltro] = useState<string>("todas"); // "todas" ou id da loja
  const [userRole, setUserRole] = useState<string>("admin");
  const [userUnidadeId, setUserUnidadeId] = useState<string>("todas");
  const [userUnidadeNome, setUserUnidadeNome] = useState<string>("Rede Consolidada");
  const [modalNovaLojaAberta, setModalNovaLojaAberta] = useState(false);
  const [salvandoNovaLoja, setSalvandoNovaLoja] = useState(false);
  const [mensagemLoja, setMensagemLoja] = useState<string | null>(null);

  const [formNovaLoja, setFormNovaLoja] = useState({
    nome: "",
    cidade: "São Paulo - SP",
    bairro: "",
    endereco: "",
    telefone: "",
    caixas: "Caixa 01, Caixa 02",
  });

  // Estados do Gerador de QR Code de Balcão
  const [unidadeAtiva, setUnidadeAtiva] = useState<string>("tatuape");
  const [caixaAtivo, setCaixaAtivo] = useState<string>("caixa_1");
  const [qrCodeGerado, setQrCodeGerado] = useState<{
    codigo: string;
    qr_url: string;
    expira_em: string;
    loja: string;
    caixa: string;
    status: string;
  } | null>(null);
  const [gerandoQr, setGerandoQr] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [telaCheiaQr, setTelaCheiaQr] = useState(false);

  // Fechar tela cheia com ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && telaCheiaQr) {
        setTelaCheiaQr(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [telaCheiaQr]);

  // Estados do Gerenciador de Terminais da Unidade
  const [modalTerminaisAberta, setModalTerminaisAberta] = useState(false);
  const [novoTerminalNome, setNovoTerminalNome] = useState("");
  const [salvandoTerminais, setSalvandoTerminais] = useState(false);
  const [mensagemTerminais, setMensagemTerminais] = useState<string | null>(null);

  // Obter lista dinâmica de terminais da loja ativa
  const lojaAlvoId = userRole === "franquia" ? (userUnidadeId || "tatuape") : (unidadeAtiva || "tatuape");
  const unidadeSelecionadaObj = unidades.find((u) => u.id === lojaAlvoId);
  const listaTerminais = unidadeSelecionadaObj?.caixas && unidadeSelecionadaObj.caixas.length > 0
    ? unidadeSelecionadaObj.caixas
    : ["Caixa 01 (Principal)", "Caixa 02", "Totem Autoatendimento", "Tablet Balcão"];

  // Sincronizar caixa ativo se a lista mudar
  useEffect(() => {
    if (listaTerminais.length > 0 && !listaTerminais.includes(caixaAtivo)) {
      setCaixaAtivo(listaTerminais[0]);
    }
  }, [listaTerminais, caixaAtivo]);

  // Adicionar novo terminal
  async function handleAdicionarTerminal() {
    if (!novoTerminalNome.trim()) return;
    const nomeLimpo = novoTerminalNome.trim();
    const novosCaixas = [...listaTerminais, nomeLimpo];

    setSalvandoTerminais(true);
    try {
      const res = await fetch("/api/fidelidade/unidades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lojaAlvoId, dados: { caixas: novosCaixas } }),
      });
      const data = await res.json();
      if (data.sucesso && data.unidades) {
        setUnidades(data.unidades);
      } else {
        setUnidades((prev) =>
          prev.map((u) => (u.id === lojaAlvoId ? { ...u, caixas: novosCaixas } : u))
        );
      }
      setNovoTerminalNome("");
      setMensagemTerminais("Terminal adicionado com sucesso!");
      setTimeout(() => setMensagemTerminais(null), 3000);
    } catch {
      setUnidades((prev) =>
        prev.map((u) => (u.id === lojaAlvoId ? { ...u, caixas: novosCaixas } : u))
      );
      setNovoTerminalNome("");
    } finally {
      setSalvandoTerminais(false);
    }
  }

  // Remover terminal
  async function handleRemoverTerminal(idxParaRemover: number) {
    if (listaTerminais.length <= 1) {
      alert("A unidade precisa ter pelo menos 1 terminal configurado.");
      return;
    }
    const novosCaixas = listaTerminais.filter((_, idx) => idx !== idxParaRemover);

    setSalvandoTerminais(true);
    try {
      const res = await fetch("/api/fidelidade/unidades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lojaAlvoId, dados: { caixas: novosCaixas } }),
      });
      const data = await res.json();
      if (data.sucesso && data.unidades) {
        setUnidades(data.unidades);
      } else {
        setUnidades((prev) =>
          prev.map((u) => (u.id === lojaAlvoId ? { ...u, caixas: novosCaixas } : u))
        );
      }
      if (caixaAtivo === listaTerminais[idxParaRemover]) {
        setCaixaAtivo(novosCaixas[0] || "Caixa 01");
      }
      setMensagemTerminais("Terminal removido com sucesso!");
      setTimeout(() => setMensagemTerminais(null), 3000);
    } catch {
      setUnidades((prev) =>
        prev.map((u) => (u.id === lojaAlvoId ? { ...u, caixas: novosCaixas } : u))
      );
    } finally {
      setSalvandoTerminais(false);
    }
  }

  // Renomear terminal
  async function handleRenomearTerminal(idx: number, novoNome: string) {
    if (!novoNome.trim()) return;
    const novosCaixas = [...listaTerminais];
    novosCaixas[idx] = novoNome.trim();

    try {
      await fetch("/api/fidelidade/unidades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lojaAlvoId, dados: { caixas: novosCaixas } }),
      });
      setUnidades((prev) =>
        prev.map((u) => (u.id === lojaAlvoId ? { ...u, caixas: novosCaixas } : u))
      );
      if (caixaAtivo === listaTerminais[idx]) {
        setCaixaAtivo(novosCaixas[idx]);
      }
    } catch {
      setUnidades((prev) =>
        prev.map((u) => (u.id === lojaAlvoId ? { ...u, caixas: novosCaixas } : u))
      );
    }
  }

  // Estados do Editor de Prêmios & Fatias da Roleta
  const [premios, setPremios] = useState<Premio[]>(MOCK_PREMIOS);
  const [salvandoPremios, setSalvandoPremios] = useState(false);
  const [mensagemPremios, setMensagemPremios] = useState<string | null>(null);

  // Seleção de qual Roleta está sendo configurada (null = Roleta Padrão Global; número = etapa.visita)
  const [roletaAlvoVisita, setRoletaAlvoVisita] = useState<number | null>(null);

  // Estados da Trilha de Visitas (Flexível N Etapas)
  const [trilha, setTrilha] = useState<import("@/lib/fidelidade/types").EtapaTrilhaVisita[]>([]);
  const [salvandoTrilha, setSalvandoTrilha] = useState(false);
  const [mensagemTrilha, setMensagemTrilha] = useState<string | null>(null);

  // Paleta de cores para novas fatias
  const CORES_FATIAS_PALETA = [
    "#e6398f", "#4a2810", "#d97706", "#7c3aed", "#059669", "#2563eb",
    "#e11d48", "#db2777", "#b45309", "#475569", "#0d9488", "#ea580c"
  ];

  // Identifica a lista de prêmios atualmente em foco (da etapa da trilha ou global)
  const etapaFoco = roletaAlvoVisita ? trilha.find((e) => e.visita === roletaAlvoVisita) : null;
  const premiosEmEdicao: Premio[] = etapaFoco?.premios_roleta && etapaFoco.premios_roleta.length > 0
    ? etapaFoco.premios_roleta
    : (roletaAlvoVisita ? JSON.parse(JSON.stringify(premios)) : premios);

  // Função para sincronizar métricas reais
  const sincronizarMetricas = () => {
    fetch("/api/fidelidade/metricas")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso) {
          setMetricasData(data);
        }
      })
      .catch(() => {});
  };

  const carregarUnidades = () => {
    fetch("/api/fidelidade/unidades")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.unidades)) {
          setUnidades(data.unidades);
        }
      })
      .catch(() => {});
  };

  // Carregar métricas reais, lojas, prêmios e trilha do backend
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ["geral", "qrcode", "premios", "trilha", "publico"].includes(tabParam)) {
        setTabAtual(tabParam as any);
      }
    }

    const role = localStorage.getItem("mb_role") || "admin";
    const unidId = localStorage.getItem("mb_unidade_id") || "todas";
    const unidNome = localStorage.getItem("mb_unidade_nome") || "Rede Consolidada";
    setUserRole(role);
    setUserUnidadeId(unidId);
    setUserUnidadeNome(unidNome);

    if (role === "franquia" && unidId && unidId !== "todas") {
      setLojaFiltro(unidId);
      setUnidadeAtiva(unidId);
    } else if (unidId && unidId !== "todas") {
      setLojaFiltro(unidId);
      setUnidadeAtiva(unidId);
    }

    sincronizarMetricas();
    carregarUnidades();
    const interval = setInterval(sincronizarMetricas, 3000);

    fetch("/api/fidelidade/premios")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.premios)) {
          setPremios(data.premios);
        }
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, []);

  // Recarregar trilha específica quando a loja selecionada mudar
  useEffect(() => {
    function carregarTrilhaDaLoja(lojaId: string) {
      const uParam =
        userRole === "franquia" && userUnidadeId && userUnidadeId !== "todas"
          ? userUnidadeId
          : lojaId === "todas"
          ? "geral"
          : lojaId;

      fetch(`/api/fidelidade/trilha?unidade=${uParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.sucesso && Array.isArray(data.trilha)) {
            setTrilha(data.trilha);
          }
        })
        .catch(() => {});
    }

    const lojaParaCarregar =
      userRole === "franquia" && userUnidadeId && userUnidadeId !== "todas"
        ? userUnidadeId
        : lojaFiltro;

    carregarTrilhaDaLoja(lojaParaCarregar);

    function handleLojaEvent(e: any) {
      if (e.detail?.id) {
        setLojaFiltro(e.detail.id);
        setUnidadeAtiva(e.detail.id === "todas" ? "tatuape" : e.detail.id);
        carregarTrilhaDaLoja(e.detail.id);
      }
    }

    function handleAbrirModalNovaLoja() {
      setModalNovaLojaAberta(true);
    }

    window.addEventListener("mb_loja_changed", handleLojaEvent);
    window.addEventListener("mb_abrir_modal_nova_loja", handleAbrirModalNovaLoja);

    return () => {
      window.removeEventListener("mb_loja_changed", handleLojaEvent);
      window.removeEventListener("mb_abrir_modal_nova_loja", handleAbrirModalNovaLoja);
    };
  }, [lojaFiltro, userRole, userUnidadeId]);

  // Handler para cadastrar nova franquia / loja
  async function handleCadastrarNovaLoja(e: React.FormEvent) {
    e.preventDefault();
    if (!formNovaLoja.nome.trim()) {
      alert("Por favor, informe o nome da loja / franquia.");
      return;
    }
    setSalvandoNovaLoja(true);
    try {
      const caixasArray = formNovaLoja.caixas
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const res = await fetch("/api/fidelidade/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formNovaLoja.nome.trim(),
          cidade: formNovaLoja.cidade.trim(),
          bairro: formNovaLoja.bairro.trim(),
          endereco: formNovaLoja.endereco.trim(),
          telefone: formNovaLoja.telefone.trim(),
          caixas: caixasArray.length > 0 ? caixasArray : ["Caixa 01"],
        }),
      });
      const data = await res.json();
      if (data.sucesso && data.unidade) {
        setUnidades(data.unidades || [...unidades, data.unidade]);
        setUnidadeAtiva(data.unidade.id);
        setLojaFiltro(data.unidade.id);
        setModalNovaLojaAberta(false);
        setFormNovaLoja({
          nome: "",
          cidade: "São Paulo - SP",
          bairro: "",
          endereco: "",
          telefone: "",
          caixas: "Caixa 01, Caixa 02",
        });
        setMensagemLoja(`✓ Loja/Franquia "${data.unidade.nome}" cadastrada com sucesso!`);
        setTimeout(() => setMensagemLoja(null), 4000);
      } else {
        alert(data.erro || "Erro ao cadastrar loja.");
      }
    } catch {
      alert("Erro de comunicação ao cadastrar loja.");
    } finally {
      setSalvandoNovaLoja(false);
    }
  }

  // Gerar QR Code de Balcão
  async function handleGerarQrCode() {
    setGerandoQr(true);
    try {
      const res = await fetch("/api/fidelidade/codigo-vinculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loja: unidadeAtiva, caixa: caixaAtivo }),
      });
      const data = await res.json();
      if (data.sucesso) {
        setQrCodeGerado(data);
      }
    } catch {
      // Fallback local se offline
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const url = `${window.location.origin}/fidelidade/girar?codigo=${randomNum}&unidade=${unidadeAtiva}`;
      setQrCodeGerado({
        codigo: String(randomNum),
        qr_url: url,
        expira_em: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        loja: unidadeAtiva,
        caixa: caixaAtivo,
        status: "aguardando",
      });
    } finally {
      setGerandoQr(false);
    }
  }

  // Copiar link de teste
  function handleCopiarLink() {
    if (!qrCodeGerado) return;
    navigator.clipboard.writeText(qrCodeGerado.qr_url);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2000);
  }

  // Imprimir comanda de balcão
  function handleImprimirComanda() {
    window.print();
  }

  // Atualizar campo de um prêmio específico da roleta ativa
  function handleModificarPremio(idx: number, campo: keyof Premio, valor: any) {
    if (roletaAlvoVisita && etapaFoco) {
      setTrilha((prev) => {
        const nova = [...prev];
        const eIdx = nova.findIndex((e) => e.visita === roletaAlvoVisita);
        if (eIdx !== -1) {
          const listaAtual = nova[eIdx].premios_roleta && nova[eIdx].premios_roleta!.length > 0
            ? [...nova[eIdx].premios_roleta!]
            : JSON.parse(JSON.stringify(premios));
          listaAtual[idx] = { ...listaAtual[idx], [campo]: valor };
          nova[eIdx] = { ...nova[eIdx], premios_roleta: listaAtual };
        }
        return nova;
      });
    } else {
      setPremios((prev) => {
        const novos = [...prev];
        novos[idx] = { ...novos[idx], [campo]: valor };
        return novos;
      });
    }
  }

  // Adicionar nova fatia na roleta atual (2 a 12 fatias)
  function handleAdicionarFatia() {
    const lista = premiosEmEdicao;
    if (lista.length >= 12) {
      alert("A roleta suporta no máximo 12 fatias para garantir excelente visibilidade.");
      return;
    }
    const novaPos = lista.length + 1;
    const novoPremio: Premio = {
      id: `premio_${Date.now()}_${novaPos}`,
      nome: `Novo Prêmio ${novaPos}`,
      tipo: "produto",
      valor: 0,
      probabilidade: 10,
      posicao_roleta: novaPos,
      ativo: true,
      limite_diario: null,
      limite_mensal: null,
      cor_fatia: CORES_FATIAS_PALETA[(novaPos - 1) % CORES_FATIAS_PALETA.length],
      icone: "🍩",
    };

    if (roletaAlvoVisita && etapaFoco) {
      setTrilha((prev) => {
        const nova = [...prev];
        const eIdx = nova.findIndex((e) => e.visita === roletaAlvoVisita);
        if (eIdx !== -1) {
          const base = nova[eIdx].premios_roleta && nova[eIdx].premios_roleta!.length > 0
            ? [...nova[eIdx].premios_roleta!]
            : JSON.parse(JSON.stringify(premios));
          nova[eIdx] = { ...nova[eIdx], premios_roleta: [...base, novoPremio] };
        }
        return nova;
      });
    } else {
      setPremios((prev) => [...prev, novoPremio]);
    }
  }

  // Remover fatia (mínimo 2 fatias)
  function handleRemoverFatia(idx: number) {
    const lista = premiosEmEdicao;
    if (lista.length <= 2) {
      alert("A roleta deve ter no mínimo 2 fatias.");
      return;
    }
    const filtrado = lista.filter((_, i) => i !== idx).map((p, i) => ({ ...p, posicao_roleta: i + 1 }));

    if (roletaAlvoVisita && etapaFoco) {
      setTrilha((prev) => {
        const nova = [...prev];
        const eIdx = nova.findIndex((e) => e.visita === roletaAlvoVisita);
        if (eIdx !== -1) {
          nova[eIdx] = { ...nova[eIdx], premios_roleta: filtrado };
        }
        return nova;
      });
    } else {
      setPremios(filtrado);
    }
  }

  // Distribuir 100% de probabilidade igualmente entre todas as fatias
  function handleDistribuirProbabilidades() {
    const lista = premiosEmEdicao;
    const qtd = lista.length;
    if (qtd === 0) return;
    const probPorFatia = Math.floor(100 / qtd);
    const resto = 100 - (probPorFatia * qtd);

    const recalculado = lista.map((p, i) => ({
      ...p,
      probabilidade: i === 0 ? probPorFatia + resto : probPorFatia,
    }));

    if (roletaAlvoVisita && etapaFoco) {
      setTrilha((prev) => {
        const nova = [...prev];
        const eIdx = nova.findIndex((e) => e.visita === roletaAlvoVisita);
        if (eIdx !== -1) {
          nova[eIdx] = { ...nova[eIdx], premios_roleta: recalculado };
        }
        return nova;
      });
    } else {
      setPremios(recalculado);
    }
  }

  // Reverter etapa para usar a roleta padrão global
  function handleUsarRoletaPadraoNaEtapa(visitaNum: number) {
    setTrilha((prev) => {
      const nova = [...prev];
      const eIdx = nova.findIndex((e) => e.visita === visitaNum);
      if (eIdx !== -1) {
        nova[eIdx] = { ...nova[eIdx], premios_roleta: undefined };
      }
      return nova;
    });
    setMensagemPremios(`✓ A ${visitaNum}ª Visita agora usará a Roleta Padrão Global!`);
    setTimeout(() => setMensagemPremios(null), 3500);
  }

  // Salvar prêmios no backend (global ou da etapa)
  async function handleSalvarPremios() {
    setSalvandoPremios(true);
    setMensagemPremios(null);

    const lista = premiosEmEdicao;
    const soma = lista.reduce((acc, p) => acc + (Number(p.probabilidade) || 0), 0);
    if (soma !== 100) {
      setMensagemPremios(`⚠️ A soma das probabilidades deve ser exatamente 100% (atual: ${soma}%). Clique em "Distribuir 100% Igualmente" para ajustar.`);
      setSalvandoPremios(false);
      return;
    }

    try {
      if (roletaAlvoVisita && etapaFoco) {
        // Salva a trilha com a roleta personalizada da etapa
        const res = await fetch("/api/fidelidade/trilha", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trilha }),
        });
        const data = await res.json();
        if (data.sucesso) {
          setMensagemPremios(`✓ Roleta exclusiva da ${roletaAlvoVisita}ª Visita salva com sucesso!`);
          setTimeout(() => setMensagemPremios(null), 4000);
        } else {
          setMensagemPremios(data.erro || "Erro ao salvar.");
        }
      } else {
        // Salva roleta padrão global
        const res = await fetch("/api/fidelidade/premios", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ premios: lista }),
        });
        const data = await res.json();
        if (data.sucesso) {
          setMensagemPremios("✓ Configurações da Roleta Padrão salvas com sucesso!");
          setTimeout(() => setMensagemPremios(null), 4000);
        } else {
          setMensagemPremios(data.erro || "Erro ao salvar alterações.");
        }
      }
    } catch {
      setMensagemPremios("Erro ao conectar com o servidor.");
    } finally {
      setSalvandoPremios(false);
    }
  }

  // Restaurar prêmios originais de fábrica
  async function handleRestaurarPadrao() {
    if (!confirm("Deseja realmente restaurar os prêmios da Roleta Padrão para a configuração original?")) return;
    setSalvandoPremios(true);
    try {
      const res = await fetch("/api/fidelidade/premios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "resetar" }),
      });
      const data = await res.json();
      if (data.sucesso && data.premios) {
        setPremios(data.premios);
        setMensagemPremios("✓ Prêmios restaurados para o padrão original!");
        setTimeout(() => setMensagemPremios(null), 4000);
      }
    } catch {
      setMensagemPremios("Erro ao restaurar.");
    } finally {
      setSalvandoPremios(false);
    }
  }

  // Manipulação da Trilha de Visitas
  function handleModificarEtapa(idx: number, campo: string, valor: any) {
    setTrilha((prev) => {
      const nova = [...prev];
      if (campo.startsWith("premio_fixo.")) {
        const sub = campo.replace("premio_fixo.", "");
        nova[idx] = {
          ...nova[idx],
          premio_fixo: {
            nome: nova[idx].premio_fixo?.nome || "Prêmio Especial",
            tipo: nova[idx].premio_fixo?.tipo || "produto",
            valor: nova[idx].premio_fixo?.valor || 0,
            icone: nova[idx].premio_fixo?.icone || "🎁",
            cor: nova[idx].premio_fixo?.cor || "#e6398f",
            [sub]: valor,
          },
        };
      } else {
        nova[idx] = { ...nova[idx], [campo]: valor };
      }
      return nova;
    });
  }

  // Adicionar uma nova etapa no fim da Trilha (N+1)
  function handleAdicionarEtapaTrilha() {
    const proximaVisita = trilha.length + 1;
    const isPar = proximaVisita % 2 === 0;
    const novaEtapa: import("@/lib/fidelidade/types").EtapaTrilhaVisita = {
      visita: proximaVisita,
      titulo: isPar ? "Roleta Premiada" : `Recompensa Especial (${proximaVisita}ª Visita)`,
      modo: isPar ? "roleta" : "fixo",
      descricao: isPar
        ? `Gire a roleta da sorte na sua ${proximaVisita}ª visita e concorra a prêmios!`
        : `Parabéns por ${proximaVisita} visitas! Recompensa garantida de fidelidade.`,
      ativo: true,
      premio_fixo: isPar
        ? undefined
        : {
            nome: "10% de Desconto",
            tipo: "desconto",
            valor: 10,
            icone: "🎁",
            cor: "#e6398f",
          },
    };
    setTrilha((prev) => [...prev, novaEtapa]);
    setMensagemTrilha(`✓ ${proximaVisita}ª Visita adicionada à trilha! Lembre-se de clicar em "Salvar Trilha".`);
    setTimeout(() => setMensagemTrilha(null), 4000);
  }

  // Remover uma etapa específica da Trilha (com re-indexação automática 1..N)
  function handleRemoverEtapaTrilha(idx: number) {
    if (trilha.length <= 2) {
      alert("A trilha de fidelidade deve conter no mínimo 2 visitas.");
      return;
    }
    const etapaAlvo = trilha[idx];
    if (!confirm(`Deseja remover a ${etapaAlvo.visita}ª Visita da trilha? A numeração de todas as etapas seguintes será atualizada automaticamente.`)) {
      return;
    }
    setTrilha((prev) => {
      const filtrada = prev.filter((_, i) => i !== idx);
      return filtrada.map((e, i) => ({
        ...e,
        visita: i + 1,
      }));
    });
    setMensagemTrilha(`✓ Etapa removida. Trilha agora conta com ${trilha.length - 1} visitas. Salve para confirmar.`);
    setTimeout(() => setMensagemTrilha(null), 4000);
  }

  async function handleSalvarTrilha() {
    setSalvandoTrilha(true);
    try {
      const targetLoja =
        userRole === "franquia" && userUnidadeId && userUnidadeId !== "todas"
          ? userUnidadeId
          : lojaFiltro === "todas"
          ? "geral"
          : lojaFiltro;

      const res = await fetch("/api/fidelidade/trilha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trilha, unidade: targetLoja }),
      });
      const data = await res.json();
      if (data.sucesso) {
        setMensagemTrilha(
          `✓ Trilha de Visitas salva com sucesso para ${
            targetLoja === "geral"
              ? "a Rede Geral (Consolidada)"
              : `a loja ${unidades.find((u) => u.id === targetLoja)?.nome || targetLoja}`
          }!`
        );
        setTimeout(() => setMensagemTrilha(null), 4000);
      }
    } catch {
      setMensagemTrilha("Erro ao salvar trilha.");
    } finally {
      setSalvandoTrilha(false);
    }
  }

  async function handleRestaurarTrilhaPadrao() {
    const targetLoja =
      userRole === "franquia" && userUnidadeId && userUnidadeId !== "todas"
        ? userUnidadeId
        : lojaFiltro === "todas"
        ? "geral"
        : lojaFiltro;

    if (
      !confirm(
        `Deseja restaurar as etapas da Trilha para a configuração padrão em ${
          targetLoja === "geral"
            ? "toda a Rede Geral"
            : `na loja ${unidades.find((u) => u.id === targetLoja)?.nome || targetLoja}`
        }?`
      )
    )
      return;
    setSalvandoTrilha(true);
    try {
      const res = await fetch("/api/fidelidade/trilha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "resetar", unidade: targetLoja }),
      });
      const data = await res.json();
      if (data.sucesso && data.trilha) {
        setTrilha(data.trilha);
        setMensagemTrilha(
          `✓ Trilha de visitas restaurada para o padrão em ${
            targetLoja === "geral"
              ? "toda a Rede Geral"
              : `na loja ${unidades.find((u) => u.id === targetLoja)?.nome || targetLoja}`
          }!`
        );
        setTimeout(() => setMensagemTrilha(null), 4000);
      }
    } catch {
      setMensagemTrilha("Erro ao restaurar.");
    } finally {
      setSalvandoTrilha(false);
    }
  }

  // Cálculos
  const somaProbabilidades = premios.reduce((acc, p) => acc + (Number(p.probabilidade) || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Executivo & Hero do Painel */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-pink-100/90 shadow-[0_4px_25px_rgba(230,57,143,0.04)] relative overflow-hidden">
        {/* Detalhe de fundo suave */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-100/40 via-amber-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Informações Principais */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-[#e6398f] rounded-full text-xs font-black tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CRM & FIDELIDADE GAMIFICADA</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Antifraude & Trava Ativa</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-gray-700 text-xs font-bold rounded-full">
                <span>🔄 Sincronização 3s</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Fidelidade, Roleta & Gestão de Balcões</span>
              <span className="text-2xl">🍩</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              Monitore giros e resgates em tempo real, gere QR Codes exclusivos por unidade, personalize fatias da roleta e acompanhe a trilha de visitas dos clientes.
            </p>
          </div>

          {/* Ações Rápidas do Header */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Link
              href="/gestao/guia-apresentacao"
              className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <span>📄 Guia Executivo</span>
            </Link>

            <Link
              href="/gestao/fidelidade/caixa"
              className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-md shadow-stone-900/15 cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
              <span>Abrir Caixa</span>
            </Link>

            <Link
              href="/fidelidade/girar?unidade=tatuape"
              target="_blank"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#e6398f] to-rose-500 text-white font-extrabold text-xs shadow-md shadow-pink-500/25 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Testar no Celular</span>
            </Link>
          </div>
        </div>

        {/* Barra Segmentada de Abas com Visual Premium */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setTabAtual("geral")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                tabAtual === "geral"
                  ? "bg-stone-900 text-white shadow-md"
                  : "bg-gray-100/90 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <BarChart2 className={`w-4 h-4 ${tabAtual === "geral" ? "text-amber-300" : "text-[#e6398f]"}`} />
              <span>Métricas Gerais</span>
            </button>

            <button
              onClick={() => {
                setTabAtual("qrcode");
                if (!qrCodeGerado) handleGerarQrCode();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                tabAtual === "qrcode"
                  ? "bg-gradient-to-r from-[#e6398f] to-rose-600 text-white shadow-md shadow-pink-500/25"
                  : "bg-gray-100/90 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Gerador de QR Code</span>
            </button>

            <button
              onClick={() => setTabAtual("trilha")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                tabAtual === "trilha"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25"
                  : "bg-gray-100/90 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Trilha de Visitas ({trilha.length} Visitas)</span>
            </button>

            <button
              onClick={() => setTabAtual("premios")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                tabAtual === "premios"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25"
                  : "bg-gray-100/90 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Fatias & Prêmios da Roleta</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-black">
                {premiosEmEdicao.length} Fatias
              </span>
            </button>

            <button
              onClick={() => setTabAtual("publico")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                tabAtual === "publico"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25"
                  : "bg-gray-100/90 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Público-Alvo & Demografia</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IDENTIFICAÇÃO DE FRANQUIA (QUANDO LOGADO COMO FRANQUIA) */}
      {/* ========================================================================= */}
      {userRole === "franquia" && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-xl font-black">
              🏪
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                Unidade Franqueada
              </p>
              <h3 className="text-base font-black text-gray-900">
                {unidades.find((u) => u.id === userUnidadeId)?.nome || userUnidadeNome || "Tatuapé"}
              </h3>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dados e Histórico Exclusivos Desta Unidade</span>
          </span>
        </div>
      )}

      {mensagemLoja && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <span>{mensagemLoja}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 1: MÉTRICAS GERAIS & DASHBOARD EM TEMPO REAL */}
      {/* ========================================================================= */}
      {tabAtual === "geral" && (
        <div className="space-y-6 animate-fade-in">
          {/* Banner de Contexto da Loja Filtrada (Apenas Admin para poder alternar) */}
          {userRole === "admin" && lojaFiltro !== "todas" && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🏪</span>
                <span>Exibindo métricas e histórico filtrados para: <strong>{unidades.find((u) => u.id === lojaFiltro)?.nome || lojaFiltro}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setLojaFiltro("todas")}
                className="text-amber-800 hover:underline font-black text-[11px] cursor-pointer"
              >
                Ver Todas as Unidades ✕
              </button>
            </div>
          )}

          {/* KPIs Principais Reais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Scans / Giros"
              valor={
                lojaFiltro === "todas"
                  ? metricasData.totalGiros
                  : metricasData.metricasUnidades.find((m) => m.id === lojaFiltro)?.scans || 0
              }
              icone={<RotateCw className="w-5 h-5" />}
              cor="text-[#e6398f]"
              bgCor="bg-pink-50"
              detalhe={lojaFiltro === "todas" ? "Giros na rede" : "Giros nesta loja"}
            />
            <KpiCard
              label="Resgates no Balcão"
              valor={
                lojaFiltro === "todas"
                  ? metricasData.totalResgates
                  : metricasData.metricasUnidades.find((m) => m.id === lojaFiltro)?.resgates || 0
              }
              icone={<CheckCircle className="w-5 h-5" />}
              cor="text-green-600"
              bgCor="bg-green-50"
              detalhe={lojaFiltro === "todas" ? "Cupons validados" : "Baixas no caixa desta loja"}
            />
            <KpiCard
              label="Taxa de Resgate Real"
              valor={
                lojaFiltro === "todas"
                  ? `${metricasData.taxaResgate}%`
                  : `${
                      (metricasData.metricasUnidades.find((m) => m.id === lojaFiltro)?.scans || 0) > 0
                        ? Math.round(
                            ((metricasData.metricasUnidades.find((m) => m.id === lojaFiltro)?.resgates || 0) /
                              (metricasData.metricasUnidades.find((m) => m.id === lojaFiltro)?.scans || 1)) *
                              100
                          )
                        : 0
                    }%`
              }
              icone={<Target className="w-5 h-5" />}
              cor="text-purple-600"
              bgCor="bg-purple-50"
              detalhe="Conversão de giro em resgate"
            />
            <KpiCard
              label="Clientes Únicos"
              valor={
                lojaFiltro === "todas"
                  ? metricasData.totalClientes
                  : metricasData.clientes.filter(
                      (c) => c.unidade_cadastro === lojaFiltro || c.loja_preferida === lojaFiltro
                    ).length
              }
              icone={<Users className="w-5 h-5" />}
              cor="text-amber-600"
              bgCor="bg-amber-50"
              detalhe="Cadastros únicos por WhatsApp"
            />
          </div>

          {/* Comparativo de Unidades (Apenas Admin) / Resumo Exclusivo (Franquia) & Frequência de Visitas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Desempenho por Unidade (Exclusivo Admin) ou Desempenho Exclusivo da Franquia */}
            {userRole === "admin" ? (
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                      <Store className="w-5 h-5 text-[#e6398f]" />
                      Métricas por Unidade (Rede Consolidada)
                    </h3>
                    <p className="text-xs text-gray-400">Comparativo operacional de giros e resgates entre filiais da rede</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {metricasData.metricasUnidades.map((u) => (
                    <div key={u.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="font-black text-gray-900 text-sm">{u.nome}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {u.scans} {u.scans === 1 ? "giro" : "giros"} • <strong className="text-green-600">{u.resgates} resgates</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden hidden sm:block">
                          <div
                            className="bg-gradient-to-r from-[#e6398f] to-green-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(u.taxa, u.scans > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-gray-800 min-w-[50px] text-right">
                          {u.taxa}% resg.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Visão 100% Exclusiva e Isolada da Franquia */
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-amber-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-black">
                        🏪
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-base">
                          Desempenho da Unidade ({userUnidadeNome})
                        </h3>
                        <p className="text-xs text-gray-500">Métricas exclusivas contabilizadas no balcão da sua loja</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-200">
                      ✓ Operação Ativa
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
                    <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Giros no Balcão</p>
                      <p className="text-xl font-black text-[#e6398f] mt-0.5">
                        {metricasData.metricasUnidades.find((m) => m.id === userUnidadeId)?.scans || 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Cupons Baixados</p>
                      <p className="text-xl font-black text-emerald-700 mt-0.5">
                        {metricasData.metricasUnidades.find((m) => m.id === userUnidadeId)?.resgates || 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Taxa de Conversão</p>
                      <p className="text-xl font-black text-purple-700 mt-0.5">
                        {metricasData.metricasUnidades.find((m) => m.id === userUnidadeId)?.taxa || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                  <span className="text-base">🔒</span>
                  <span>Isolamento Total: Seus clientes, giros e cupons são 100% confidenciais desta unidade.</span>
                </div>
              </div>
            )}

            {/* Frequência e Visitas dos Clientes (Calculada por Unidade ou Rede) */}
            {(() => {
              const clientesDaUnidade = userRole === "franquia" && userUnidadeId && userUnidadeId !== "todas"
                ? metricasData.clientes.filter((c) => {
                    const u = (c.loja_preferida || c.unidade_cadastro || "").toLowerCase();
                    return u === userUnidadeId.toLowerCase() || u.includes(userUnidadeId.toLowerCase());
                  })
                : metricasData.clientes;

              const totalCli = clientesDaUnidade.length;
              const g1 = clientesDaUnidade.filter((c) => c.qtd_compras === 1).length;
              const g2 = clientesDaUnidade.filter((c) => c.qtd_compras >= 2 && c.qtd_compras <= 4).length;
              const g3 = clientesDaUnidade.filter((c) => c.qtd_compras >= 5 && c.qtd_compras <= 9).length;
              const g4 = clientesDaUnidade.filter((c) => c.qtd_compras >= 10).length;

              const freqList = [
                { nivel: "1ª Compra / 1º Giro", qtd: g1, percentual: totalCli > 0 ? Math.round((g1 / totalCli) * 100) : 0, cor: "bg-blue-500" },
                { nivel: "2 a 4 Compras (Recorrente)", qtd: g2, percentual: totalCli > 0 ? Math.round((g2 / totalCli) * 100) : 0, cor: "bg-[#e6398f]" },
                { nivel: "5 a 9 Compras (Frequente)", qtd: g3, percentual: totalCli > 0 ? Math.round((g3 / totalCli) * 100) : 0, cor: "bg-purple-500" },
                { nivel: "10+ Compras (VIP / Fiel)", qtd: g4, percentual: totalCli > 0 ? Math.round((g4 / totalCli) * 100) : 0, cor: "bg-amber-500" },
              ];

              return (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base mb-1 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>Frequência de Visitas & Recorrência</span>
                    </h3>
                    <p className="text-xs text-gray-400 mb-6">
                      {userRole === "franquia"
                        ? `Classificação dos clientes da unidade ${userUnidadeNome}`
                        : "Classificação dos clientes reais pelo histórico de giros"}
                    </p>

                    <div className="space-y-4">
                      {freqList.map((f, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-gray-700">
                            <span>{f.nivel}</span>
                            <span>{f.qtd} clientes ({f.percentual}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className={`${f.cor} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.max(f.percentual, f.qtd > 0 ? 6 : 0)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 bg-pink-50/50 p-4 rounded-2xl border border-pink-100 text-xs text-pink-950 font-medium">
                    💡 <strong>Deduplicação Ativa:</strong> Clientes identificados pelo Celular/WhatsApp têm seus giros e visitas unificados automaticamente.
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Feed de Resgates em Tempo Real (Filtrado por Unidade para Franquia) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span>
                  {userRole === "franquia"
                    ? `Feed de Resgates nos Caixas (${userUnidadeNome})`
                    : "Feed de Resgates nos Caixas (Tempo Real)"}
                </span>
              </h3>
              <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Sincronizado
              </span>
            </div>

            {(() => {
              const resgatesFiltrados = userRole === "franquia" && userUnidadeId && userUnidadeId !== "todas"
                ? metricasData.resgatesRecentes.filter(
                    (r: any) =>
                      (r.unidade_id || "").toLowerCase() === userUnidadeId.toLowerCase() ||
                      (r.unidade || "").toLowerCase() === (userUnidadeNome || "").toLowerCase() ||
                      (r.unidade || "").toLowerCase().includes(userUnidadeId.toLowerCase()) ||
                      (r.unidade || "").toLowerCase().includes((userUnidadeNome || "").toLowerCase())
                  )
                : metricasData.resgatesRecentes;

              return resgatesFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {resgatesFiltrados.map((r) => (
                    <div key={r.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{r.cliente}</span>
                          <span className="px-2 py-0.5 bg-pink-100 text-[#e6398f] font-extrabold text-[10px] rounded-md">
                            {r.visita}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Unidade {r.unidade} • <strong className="text-gray-700">{r.premio}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-amber-600">{r.codigo}</span>
                        <p className="text-[10px] text-gray-400">{r.hora}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-1">
                  <p className="text-xs font-bold text-gray-700">Aguardando primeiros resgates do dia no caixa</p>
                  <p className="text-[11px] text-gray-400">
                    Assim que um cliente apresentar o código e o caixa validar, o registro aparecerá aqui instantaneamente.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: GERADOR DE QR CODE DE BALCÃO (COMANDA / DISPLAY) */}
      {/* ========================================================================= */}
      {tabAtual === "qrcode" && (
        <div className="space-y-6 animate-fade-in">
          {/* Barra de Seleção de Loja e Caixa do Balcão */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Unidade / Loja do Balcão
                </label>
                {userRole === "admin" ? (
                  <select
                    value={unidadeAtiva}
                    onChange={(e) => {
                      setUnidadeAtiva(e.target.value);
                      setQrCodeGerado(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 font-bold text-sm focus:border-[#e6398f] outline-none cursor-pointer"
                  >
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-2.5 rounded-xl bg-amber-50 border-2 border-amber-200 text-stone-900 font-black text-sm flex items-center gap-2">
                    <span>🏪 {unidades.find((u) => u.id === userUnidadeId)?.nome || userUnidadeNome || "Tatuapé"}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Terminal / Caixa
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalTerminaisAberta(true)}
                    className="text-[11px] text-[#e6398f] hover:text-pink-700 font-black flex items-center gap-1 cursor-pointer transition-colors"
                    title="Adicionar, renomear ou remover terminais desta unidade"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Editar Terminais</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={caixaAtivo}
                    onChange={(e) => {
                      setCaixaAtivo(e.target.value);
                      setQrCodeGerado(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 font-bold text-sm focus:border-[#e6398f] outline-none min-w-[200px] cursor-pointer"
                  >
                    {listaTerminais.map((term, idx) => (
                      <option key={idx} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setModalTerminaisAberta(true)}
                    className="p-2.5 rounded-xl border-2 border-gray-200 hover:border-pink-300 bg-gray-50 hover:bg-pink-50 text-gray-600 hover:text-[#e6398f] transition-all cursor-pointer shadow-xs"
                    title="Gerenciar terminais e pontos de venda"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleGerarQrCode}
              disabled={gerandoQr}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-extrabold text-sm shadow-xl shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${gerandoQr ? "animate-spin" : ""}`} />
              <span>Gerar Novo QR Code de 1 Giro</span>
            </button>
          </div>

          {/* Modal Gerenciador de Terminais da Unidade */}
          {modalTerminaisAberta && (
            <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                      <Store className="w-5 h-5 text-[#e6398f]" />
                      Terminais & Caixas da Loja
                    </h3>
                    <p className="text-xs text-gray-400">
                      Unidade: <strong className="text-gray-700">{unidadeSelecionadaObj?.nome || userUnidadeNome}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setModalTerminaisAberta(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {mensagemTerminais && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{mensagemTerminais}</span>
                  </div>
                )}

                {/* Formulário de Adicionar Novo Terminal */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    + Adicionar Novo Terminal / Ponto de Atendimento:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={novoTerminalNome}
                      onChange={(e) => setNovoTerminalNome(e.target.value)}
                      placeholder="Ex: Caixa 03, Tablet Mesa 05, Totem..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-800 outline-none focus:border-[#e6398f]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdicionarTerminal();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAdicionarTerminal}
                      disabled={salvandoTerminais || !novoTerminalNome.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e6398f] to-rose-600 text-white font-black text-xs shadow-md shadow-pink-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{salvandoTerminais ? "..." : "Adicionar"}</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Terminais Cadastrados com Edição e Exclusão */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Terminais Ativos ({listaTerminais.length}):
                  </label>
                  {listaTerminais.map((term, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 group hover:bg-white hover:border-pink-200 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-pink-100 text-[#e6398f] font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          defaultValue={term}
                          onBlur={(e) => handleRenomearTerminal(idx, e.target.value)}
                          className="w-full text-xs font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-[#e6398f] outline-none py-0.5"
                          title="Clique para renomear"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverTerminal(idx)}
                        disabled={listaTerminais.length <= 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors cursor-pointer"
                        title={listaTerminais.length <= 1 ? "Mínimo de 1 terminal" : "Remover terminal"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>💡 Clique no nome do terminal para renomear</span>
                  <button
                    type="button"
                    onClick={() => setModalTerminaisAberta(false)}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Exibição da Comanda / Display para o Cliente */}
          {qrCodeGerado ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Display de Alta Resolução para Balcão ou Impressão */}
              <div className="lg:col-span-7 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-8 border border-stone-800 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                {/* Botão de Tela Cheia no Topo Esquerdo */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTelaCheiaQr(true)}
                    className="px-3 py-1.5 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    title="Expandir para Tela Cheia (Ideal para Tablet ou Monitor do Balcão)"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>Tela Cheia</span>
                  </button>
                </div>

                {/* Badge de Status no Topo Direito */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                  <span>Aguardando Leitura do Cliente</span>
                </div>

                <div className="text-4xl mb-2 mt-4 sm:mt-0">🍩</div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#e6398f] font-black">
                  Melhor Bocado • Fidelidade
                </span>
                <h2 className="text-2xl font-black mt-1 mb-1">
                  Escaneie & Gire a Roleta!
                </h2>
                <p className="text-xs text-stone-400 max-w-sm mb-6">
                  Aponte a câmera do seu celular para o QR Code abaixo. Cada compra dá direito a 1 giro com prêmios imediatos.
                </p>

                {/* QR Code SVG Gerado com Botão de Recarregar Integrado */}
                <div className="relative my-2 group">
                  <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-amber-300">
                    <QrCodeSvg value={qrCodeGerado.qr_url} size={240} />
                  </div>

                  {/* Botão de Recarregar Compacto Próximo ao QR Code */}
                  <button
                    type="button"
                    onClick={handleGerarQrCode}
                    disabled={gerandoQr}
                    title="Gerar / Recarregar novo QR Code de 1 giro"
                    className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#e6398f] to-rose-600 hover:from-[#d82a80] hover:to-rose-700 text-white font-extrabold text-xs shadow-xl shadow-pink-500/40 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 border-2 border-stone-900"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${gerandoQr ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                    <span>Recarregar</span>
                  </button>
                </div>

                {/* Código de Backup */}
                <div className="mt-6 bg-stone-800/80 px-6 py-3 rounded-2xl border border-stone-700">
                  <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                    Código de Compra (Backup)
                  </p>
                  <p className="text-3xl font-mono font-black tracking-[0.3em] text-white mt-0.5">
                    {qrCodeGerado.codigo}
                  </p>
                </div>

                <p className="text-[11px] text-stone-400 mt-4">
                  Unidade: <strong className="text-white uppercase">{qrCodeGerado.loja}</strong> • Terminal: <strong className="text-white">{qrCodeGerado.caixa}</strong>
                </p>
              </div>

              {/* Modal Display Kiosk de Tela Cheia */}
              {telaCheiaQr && (
                <div className="fixed inset-0 z-50 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-4 sm:p-8 text-white overflow-y-auto animate-fade-in backdrop-blur-2xl">
                  {/* Botões de Ação Topo */}
                  <div className="fixed top-6 right-6 flex items-center gap-3 z-50">
                    <button
                      type="button"
                      onClick={handleGerarQrCode}
                      disabled={gerandoQr}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#e6398f] to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-pink-400/30"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${gerandoQr ? "animate-spin" : ""}`} />
                      <span>Novo QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTelaCheiaQr(false)}
                      className="px-4 py-2 rounded-2xl bg-stone-800/90 hover:bg-stone-700 text-white font-bold text-xs border border-stone-700 shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <Minimize2 className="w-4 h-4 text-gray-300" />
                      <span>Sair da Tela Cheia</span>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-stone-700 rounded font-mono text-stone-300">ESC</kbd>
                    </button>
                  </div>

                  {/* Conteúdo Central do Totem */}
                  <div className="flex flex-col items-center text-center max-w-lg w-full my-auto py-6">
                    <div className="text-5xl mb-3">🍩</div>
                    <span className="text-sm uppercase tracking-[0.25em] text-[#e6398f] font-black">
                      Melhor Bocado • Fidelidade
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black mt-1 mb-2 tracking-tight">
                      Escaneie & Gire a Roleta!
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-300 max-w-md mb-6 leading-relaxed">
                      Aponte a câmera do seu celular para o QR Code abaixo. Cada compra dá direito a 1 giro com prêmios imediatos.
                    </p>

                    {/* QR Code Grande com Botão de Recarga ao Lado */}
                    <div className="relative group my-2">
                      <div className="p-6 bg-white rounded-3xl shadow-2xl border-4 border-amber-300">
                        <QrCodeSvg value={qrCodeGerado.qr_url} size={280} />
                      </div>

                      <button
                        type="button"
                        onClick={handleGerarQrCode}
                        disabled={gerandoQr}
                        title="Recarregar QR Code"
                        className="absolute -bottom-4 -right-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#e6398f] to-rose-600 hover:from-[#d82a80] hover:to-rose-700 text-white font-black text-xs shadow-2xl shadow-pink-500/50 active:scale-95 transition-all cursor-pointer flex items-center gap-2 border-2 border-stone-950"
                      >
                        <RefreshCw className={`w-4 h-4 ${gerandoQr ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                        <span>Recarregar</span>
                      </button>
                    </div>

                    {/* Código de Backup */}
                    <div className="mt-8 bg-stone-800/90 px-8 py-3.5 rounded-2xl border border-stone-700 shadow-xl">
                      <p className="text-[11px] text-amber-300 font-extrabold uppercase tracking-widest">
                        Código de Compra (Backup)
                      </p>
                      <p className="text-3xl sm:text-4xl font-mono font-black tracking-[0.35em] text-white mt-1">
                        {qrCodeGerado.codigo}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-4 text-xs text-stone-400">
                      <span>Unidade: <strong className="text-white uppercase">{qrCodeGerado.loja}</strong></span>
                      <span>•</span>
                      <span>Terminal: <strong className="text-white">{qrCodeGerado.caixa}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Controles do Balconista & Ações */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Regras de Segurança & Antifraude
                  </h3>

                  <ul className="space-y-2.5 text-xs text-gray-600 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Uso Único:</strong> Este QR code é invalidado pelo sistema imediatamente após o primeiro giro do cliente.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Isolamento de Loja:</strong> O QR Code gerado pertence exclusivamente à unidade <strong>{unidadeAtiva.toUpperCase()}</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Deduplicação de Cliente:</strong> O histórico de visitas e fidelização é unificado pelo número de WhatsApp.</span>
                    </li>
                  </ul>

                  <div className="pt-2 border-t border-gray-100 space-y-2.5">
                    <button
                      onClick={handleCopiarLink}
                      className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiadoLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      <span>{copiadoLink ? "Link Copiado para Área de Transferência!" : "Copiar Link Direto do QR Code"}</span>
                    </button>

                    <a
                      href={qrCodeGerado.qr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#e6398f] font-bold text-xs flex items-center justify-center gap-2 transition-all text-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Abrir Roleta como Cliente (Nova Aba)</span>
                    </a>

                    <button
                      onClick={handleImprimirComanda}
                      className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>Imprimir Comanda do Balcão</span>
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 text-xs text-amber-950 font-medium">
                  💡 <strong>Dica Operacional:</strong> Você pode manter esta tela aberta no tablet do caixa voltado para o cliente ou imprimir comandas pré-geradas na abertura do turno.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
              <p className="text-sm text-gray-500 font-bold">Clique em &ldquo;Gerar Novo QR Code de 1 Giro&rdquo; para começar.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: TRILHA DE VISITAS DE FIDELIDADE (QUALQUER QUANTIDADE DE VISITAS) */}
      {/* ========================================================================= */}
      {tabAtual === "trilha" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header e Ações */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800 font-black text-sm">
                  📍 Trilha de Recompensas por Visita ({trilha.length} Visitas Configuradas)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-[#e6398f] text-[10px] font-black uppercase">
                  Fidelômetro Ativo
                </span>
                <span className="px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-xs font-black border border-stone-800 flex items-center gap-1.5 shadow-xs">
                  <span>🏬 Loja em Edição:</span>
                  <span className="text-white">
                    {lojaFiltro === "todas"
                      ? "Rede Consolidada (Geral)"
                      : `Loja ${unidades.find((u) => u.id === lojaFiltro)?.nome || lojaFiltro}`}
                  </span>
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Adicione ou remova visitas para montar trilhas com <strong>quantas etapas desejar</strong>. Cada loja pode ter sua própria trilha independente ou seguir o padrão da Rede Geral.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAdicionarEtapaTrilha}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Adicionar Visita ({trilha.length + 1}ª Visita)</span>
              </button>

              <button
                onClick={handleRestaurarTrilhaPadrao}
                disabled={salvandoTrilha}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${salvandoTrilha ? "animate-spin" : ""}`} />
                <span>Restaurar 10 Visitas</span>
              </button>

              <button
                onClick={handleSalvarTrilha}
                disabled={salvandoTrilha}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e6398f] to-amber-600 text-white font-black text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{salvandoTrilha ? "Salvando..." : "Salvar Trilha"}</span>
              </button>
            </div>
          </div>

          {mensagemTrilha && (
            <div className="p-4 bg-green-50 rounded-2xl border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <span>{mensagemTrilha}</span>
            </div>
          )}

          {/* Grid dos Marcos de Visita Dinâmicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trilha.map((etapa, idx) => (
              <div
                key={etapa.visita}
                className={`p-5 rounded-3xl border-2 transition-all space-y-4 ${
                  etapa.modo === "fixo"
                    ? "bg-amber-50/40 border-amber-200"
                    : "bg-pink-50/40 border-pink-200"
                }`}
              >
                {/* Topo do Card: Número da Visita + Modo + Botão Excluir */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-stone-900 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                      {etapa.visita}ª
                    </span>
                    <div className="truncate">
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                        {etapa.visita === 1
                          ? "Primeiro Acesso / Boas-Vindas"
                          : etapa.visita === trilha.length
                          ? "🏆 Marco VIP Final"
                          : `${etapa.visita}ª Compra no Balcão`}
                      </span>
                      <h4 className="font-black text-gray-900 text-sm truncate">{etapa.titulo}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Seletor de Modo */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleModificarEtapa(idx, "modo", "fixo")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          etapa.modo === "fixo"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        🎁 Fixo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModificarEtapa(idx, "modo", "roleta")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          etapa.modo === "roleta"
                            ? "bg-[#e6398f] text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        🎰 Roleta
                      </button>
                    </div>

                    {/* Botão de Excluir Etapa */}
                    {trilha.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoverEtapaTrilha(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title={`Excluir a ${etapa.visita}ª Visita`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Conteúdo Dinâmico por Modo */}
                {etapa.modo === "fixo" ? (
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-8">
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                          Nome do Prêmio Fixo
                        </label>
                        <input
                          type="text"
                          value={etapa.premio_fixo?.nome || ""}
                          onChange={(e) => handleModificarEtapa(idx, "premio_fixo.nome", e.target.value)}
                          placeholder="Ex: Café Expresso Grátis"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                          Ícone
                        </label>
                        <input
                          type="text"
                          value={etapa.premio_fixo?.icone || "🎁"}
                          onChange={(e) => handleModificarEtapa(idx, "premio_fixo.icone", e.target.value)}
                          placeholder="☕"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center text-sm font-bold text-gray-900 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                          Tipo de Recompensa
                        </label>
                        <select
                          value={etapa.premio_fixo?.tipo || "produto"}
                          onChange={(e) => handleModificarEtapa(idx, "premio_fixo.tipo", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none"
                        >
                          <option value="produto">🍩 Produto 100% Grátis</option>
                          <option value="desconto">💰 Desconto em Porcentagem (%)</option>
                          <option value="desconto_reais">💵 Desconto em Dinheiro (R$)</option>
                        </select>
                      </div>

                      {etapa.premio_fixo?.tipo === "desconto" ? (
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                            Valor do Desconto (%)
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={etapa.premio_fixo?.valor || 10}
                              onChange={(e) => handleModificarEtapa(idx, "premio_fixo.valor", Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-pink-600 text-center outline-none"
                            />
                            <span className="text-xs font-black text-pink-600">% OFF</span>
                          </div>
                        </div>
                      ) : etapa.premio_fixo?.tipo === "desconto_reais" ? (
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                            Valor do Desconto (R$)
                          </label>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-emerald-600">R$</span>
                            <input
                              type="number"
                              min="1"
                              step="0.5"
                              value={etapa.premio_fixo?.valor || 5}
                              onChange={(e) => handleModificarEtapa(idx, "premio_fixo.valor", Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-emerald-600 text-center outline-none"
                            />
                            <span className="text-xs font-black text-emerald-600">OFF</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                            Status
                          </label>
                          <div className="py-2 px-3 bg-green-50 text-green-700 font-extrabold text-xs rounded-xl border border-green-200 text-center">
                            ✓ Entregue Direto
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                        Mensagem de Incentivo
                      </label>
                      <input
                        type="text"
                        value={etapa.descricao || ""}
                        onChange={(e) => handleModificarEtapa(idx, "descricao", e.target.value)}
                        placeholder="Ex: Ganhe 1 Café Expresso no seu 1º pedido!"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-pink-100 text-[#e6398f] rounded-lg text-xs font-black">
                          🎰 Roleta da {etapa.visita}ª Visita
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          {etapa.premios_roleta && etapa.premios_roleta.length > 0
                            ? `${etapa.premios_roleta.length} Fatias Exclusivas`
                            : `${premios.length} Fatias (Roleta Padrão)`}
                        </span>
                      </div>

                      {etapa.premios_roleta && etapa.premios_roleta.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                          Customizada
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                        Título da Etapa
                      </label>
                      <input
                        type="text"
                        value={etapa.titulo}
                        onChange={(e) => handleModificarEtapa(idx, "titulo", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none"
                      />
                    </div>

                    {/* Preview e Fatias da Roleta com Enquadramento Perfeito */}
                    <div className="bg-gradient-to-br from-pink-50/60 to-rose-50/30 p-3.5 sm:p-4 rounded-2xl border border-pink-100 flex flex-col md:flex-row items-center gap-4">
                      {/* Container da Roleta com Tamanho Fixo e Proporcional */}
                      <div className="w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center relative p-1 bg-white/80 rounded-2xl border border-pink-100 shadow-xs">
                        <RoletaMini
                          premios={etapa.premios_roleta && etapa.premios_roleta.length > 0 ? etapa.premios_roleta : premios}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Informações das Fatias e Botão de Ação */}
                      <div className="flex-1 w-full space-y-2.5 text-left flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="text-[11px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                              <span>🎯 Fatias & Prêmios desta Roleta:</span>
                            </p>
                            <span className="px-2 py-0.5 rounded-md bg-pink-100 text-[#e6398f] text-[10px] font-black">
                              {(etapa.premios_roleta && etapa.premios_roleta.length > 0 ? etapa.premios_roleta : premios).length} Fatias
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-1">
                            {(etapa.premios_roleta && etapa.premios_roleta.length > 0 ? etapa.premios_roleta : premios).map((p, pIdx) => (
                              <div
                                key={p.id || pIdx}
                                className="flex items-center justify-between gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white border border-gray-200 text-gray-800 shadow-xs"
                              >
                                <span className="flex items-center gap-1 min-w-0 truncate">
                                  <span className="shrink-0">{p.icone || "🎁"}</span>
                                  <span className="truncate">{p.nome}</span>
                                </span>
                                <span className="text-[#e6398f] font-black shrink-0 text-[9px] bg-pink-50 px-1 py-0.2 rounded">
                                  {p.probabilidade}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setRoletaAlvoVisita(etapa.visita);
                            setTabAtual("premios");
                          }}
                          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#e6398f] to-[#b51e6c] hover:opacity-95 text-white text-xs font-extrabold rounded-xl shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-1"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Configurar Fatias da Roleta ({etapa.visita}ª Visita)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: CONFIGURADOR DE PRÊMIOS & QUANTIDADE DE FATIAS DA ROLETA */}
      {/* ========================================================================= */}
      {tabAtual === "premios" && (
        <div className="space-y-6 animate-fade-in">
          {/* Seletor de Roleta Alvo (Global ou de Etapa Específica) */}
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-900 rounded-xl text-xs font-black">
                  🎯 Roleta em Edição
                </span>
                <h3 className="text-sm font-black text-gray-900">
                  {roletaAlvoVisita
                    ? `Roleta Exclusiva da ${roletaAlvoVisita}ª Visita`
                    : "Roleta Padrão Global"}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Alterne entre a Roleta Padrão ou personalize roletas únicas para visitas específicas da trilha.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setRoletaAlvoVisita(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  roletaAlvoVisita === null
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🌐 Roleta Padrão
              </button>

              {trilha
                .filter((e) => e.modo === "roleta")
                .map((e) => (
                  <button
                    key={e.visita}
                    type="button"
                    onClick={() => setRoletaAlvoVisita(e.visita)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                      roletaAlvoVisita === e.visita
                        ? "bg-[#e6398f] text-white shadow-sm"
                        : "bg-pink-50 text-[#e6398f] hover:bg-pink-100"
                    }`}
                  >
                    <span>{e.visita}ª Visita</span>
                    {e.premios_roleta && e.premios_roleta.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Header e Preview da Roleta */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Miniatura da Roleta com Preview em Tempo Real */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 text-base flex items-center justify-center gap-2">
                  <Gift className="w-5 h-5 text-[#e6398f]" />
                  Preview da Roleta ({premiosEmEdicao.length} Fatias)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Visualização em tempo real conforme você ajusta as fatias
                </p>
              </div>

              <div className="w-full flex items-center justify-center py-2 overflow-hidden">
                <Roleta
                  premios={premiosEmEdicao}
                  posicaoSorteada={null}
                  girando={false}
                />
              </div>

              <div className="w-full bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-gray-700">
                  <span>Total de Fatias:</span>
                  <span className="font-black text-gray-900">{premiosEmEdicao.length} Fatias</span>
                </div>
                <div className="flex justify-between font-bold text-gray-700">
                  <span>Soma das Probabilidades:</span>
                  <span
                    className={
                      premiosEmEdicao.reduce((acc, p) => acc + (Number(p.probabilidade) || 0), 0) === 100
                        ? "text-green-600 font-black"
                        : "text-red-600 font-black"
                    }
                  >
                    {premiosEmEdicao.reduce((acc, p) => acc + (Number(p.probabilidade) || 0), 0)}%{" "}
                    {premiosEmEdicao.reduce((acc, p) => acc + (Number(p.probabilidade) || 0), 0) === 100
                      ? "✓ (Perfeito)"
                      : "⚠️ (Deve ser 100%)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabela de Edição de Fatias e Prêmios */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-gray-900 text-base">
                    Configurar Fatias da Roleta
                  </h3>
                  <p className="text-xs text-gray-400">
                    Aumente ou diminua a quantidade de fatias, altere nomes, descontos e probabilidades
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {roletaAlvoVisita ? (
                    <button
                      onClick={() => handleUsarRoletaPadraoNaEtapa(roletaAlvoVisita)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Undo className="w-3.5 h-3.5" />
                      <span>Usar Roleta Padrão</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRestaurarPadrao}
                      disabled={salvandoPremios}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      Restaurar Padrão
                    </button>
                  )}

                  <button
                    onClick={handleSalvarPremios}
                    disabled={salvandoPremios}
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#e6398f] hover:bg-[#c22176] text-white shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{salvandoPremios ? "Salvando..." : "Salvar Configuração"}</span>
                  </button>
                </div>
              </div>

              {mensagemPremios && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    mensagemPremios.includes("✓")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{mensagemPremios}</span>
                </div>
              )}

              {/* Barra de Ferramentas de Fatias */}
              <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-700">
                    Fatias Ativas: <strong className="text-[#e6398f]">{premiosEmEdicao.length}</strong> / 12
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDistribuirProbabilidades}
                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Divide 100% igualmente entre todas as fatias"
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-500" />
                    <span>Distribuir 100% Igualmente</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAdicionarFatia}
                    disabled={premiosEmEdicao.length >= 12}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Fatia</span>
                  </button>
                </div>
              </div>

              {/* Cabeçalho explicativo das colunas */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-stone-100/80 rounded-xl text-[11px] font-black text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Fatia</div>
                <div className="col-span-1">Ícone</div>
                <div className="col-span-4">Nome do Prêmio / Brinde</div>
                <div className="col-span-2">Modalidade</div>
                <div className="col-span-2 text-center">Benefício</div>
                <div className="col-span-1 text-center">Chance (%)</div>
                <div className="col-span-1 text-center">Excluir</div>
              </div>

              {/* Lista Dinâmica de Fatias */}
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {premiosEmEdicao.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-3 rounded-2xl border border-gray-200/80 bg-gray-50/60 hover:bg-white transition-all grid grid-cols-12 gap-2 items-center text-xs shadow-xs"
                  >
                    {/* Posição & Cor */}
                    <div className="col-span-1 flex items-center gap-1.5 font-black text-gray-600">
                      <span
                        className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: p.cor_fatia || CORES_FATIAS_PALETA[idx % CORES_FATIAS_PALETA.length] }}
                      />
                      <span>#{idx + 1}</span>
                    </div>

                    {/* Ícone */}
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={p.icone || "🎁"}
                        onChange={(e) => handleModificarPremio(idx, "icone", e.target.value)}
                        className="w-8 h-8 text-center text-base rounded-lg border border-gray-200 bg-white"
                        title="Emoji / Ícone"
                      />
                    </div>

                    {/* Nome do Prêmio */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={p.nome}
                        onChange={(e) => handleModificarPremio(idx, "nome", e.target.value)}
                        placeholder="Ex: Donut Glazed Clássico"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-bold text-gray-800 focus:border-[#e6398f] outline-none"
                      />
                    </div>

                    {/* Modalidade */}
                    <div className="col-span-2">
                      <select
                        value={p.tipo}
                        onChange={(e) => handleModificarPremio(idx, "tipo", e.target.value as any)}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 outline-none text-[11px]"
                      >
                        <option value="produto">🎁 Brinde Grátis</option>
                        <option value="desconto">🏷️ Desconto %</option>
                        <option value="desconto_reais">💵 Desconto R$</option>
                      </select>
                    </div>

                    {/* Benefício (Desconto % ou Desconto R$ ou Brinde Grátis) */}
                    <div className="col-span-2 flex items-center justify-center">
                      {p.tipo === "desconto" ? (
                        <div className="flex items-center gap-1 w-full max-w-[100px]">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={p.valor}
                            onChange={(e) => handleModificarPremio(idx, "valor", Number(e.target.value))}
                            placeholder="10"
                            className="w-full px-2 py-1.5 rounded-lg border border-pink-200 bg-pink-50 text-[#e6398f] font-black text-center text-xs outline-none"
                          />
                          <span className="text-pink-600 font-extrabold text-xs">% OFF</span>
                        </div>
                      ) : p.tipo === "desconto_reais" ? (
                        <div className="flex items-center gap-1 w-full max-w-[110px]">
                          <span className="text-emerald-700 font-extrabold text-xs">R$</span>
                          <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={p.valor}
                            onChange={(e) => handleModificarPremio(idx, "valor", Number(e.target.value))}
                            placeholder="5"
                            className="w-full px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-black text-center text-xs outline-none"
                          />
                          <span className="text-emerald-700 font-extrabold text-xs">OFF</span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-extrabold rounded-md border border-green-200">
                          100% Grátis
                        </span>
                      )}
                    </div>

                    {/* Chance / Probabilidade de Sair na Roleta (%) */}
                    <div className="col-span-1">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={p.probabilidade}
                          onChange={(e) => handleModificarPremio(idx, "probabilidade", Number(e.target.value))}
                          placeholder="20"
                          className="w-14 px-1.5 py-1.5 rounded-lg border-2 border-amber-300 bg-amber-50 font-black text-center text-stone-900 outline-none text-xs focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Ação: Excluir Fatia */}
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoverFatia(idx)}
                        disabled={premiosEmEdicao.length <= 2}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-pointer"
                        title={premiosEmEdicao.length <= 2 ? "A roleta precisa de pelo menos 2 fatias" : "Excluir fatia"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* ABA 4: PÚBLICO-ALVO & DEMOGRAFIA REAL */}
      {/* ========================================================================= */}
      {tabAtual === "publico" && (
        <div className="space-y-6 animate-fade-in">
          <PainelPublicoAlvo
            clientes={metricasData.clientes}
            unidadeFranquiaId={userUnidadeId}
            unidadeFranquiaNome={userUnidadeNome}
            role={userRole}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO DE NOVA LOJA / FRANQUIA */}
      {/* ========================================================================= */}
      {modalNovaLojaAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl text-base font-black">
                  🏪
                </span>
                <div>
                  <h3 className="font-black text-gray-900 text-base">Cadastrar Nova Loja / Franquia</h3>
                  <p className="text-xs text-gray-500 font-medium">Adicione uma nova unidade da rede para operar roletas e caixas.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalNovaLojaAberta(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCadastrarNovaLoja} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">
                  Nome da Franquia / Loja *
                </label>
                <input
                  type="text"
                  required
                  value={formNovaLoja.nome}
                  onChange={(e) => setFormNovaLoja((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Pinheiros, Shopping Anália Franco, Campinas"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">
                    Cidade - UF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNovaLoja.cidade}
                    onChange={(e) => setFormNovaLoja((prev) => ({ ...prev, cidade: e.target.value }))}
                    placeholder="São Paulo - SP"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formNovaLoja.bairro}
                    onChange={(e) => setFormNovaLoja((prev) => ({ ...prev, bairro: e.target.value }))}
                    placeholder="Ex: Pinheiros"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={formNovaLoja.endereco}
                  onChange={(e) => setFormNovaLoja((prev) => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Ex: Rua Joaquim Floriano, 120"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">
                  Terminais de Caixa (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formNovaLoja.caixas}
                  onChange={(e) => setFormNovaLoja((prev) => ({ ...prev, caixas: e.target.value }))}
                  placeholder="Caixa 01, Caixa 02, Totem 01"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalNovaLojaAberta(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvandoNovaLoja}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{salvandoNovaLoja ? "Cadastrando..." : "Cadastrar Franquia"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  valor,
  icone,
  cor,
  bgCor,
  detalhe,
}: {
  label: string;
  valor: string | number;
  icone: React.ReactNode;
  cor: string;
  bgCor: string;
  detalhe?: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`p-2 rounded-xl ${bgCor} ${cor}`}>{icone}</div>
        <span className="text-xs text-gray-500 font-bold">{label}</span>
      </div>
      <p className="text-3xl font-black text-gray-900">{valor}</p>
      {detalhe && <p className="text-[11px] text-gray-400 mt-1">{detalhe}</p>}
    </div>
  );
}


// =============================================================================
// Mock Data — Dados simulados do módulo Fidelidade
// Tudo in-memory, sem dependência de banco. Banco entra por último.
// =============================================================================

import type {
  Cliente,
  CodigoVinculo,
  Venda,
  VendaItem,
  Giro,
  Premio,
  Cupom,
  Config,
  AutomacaoLog,
  VendaPDV,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function id(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function minutesAgo(min: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - min);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Catálogo de produtos (donuts, café, salgados)
// ---------------------------------------------------------------------------

export const PRODUTOS_CARDAPIO = [
  { codigo: 1, nome: "Donut Tradicional", preco: 8.9 },
  { codigo: 2, nome: "Donut Nutella", preco: 12.9 },
  { codigo: 3, nome: "Donut Red Velvet", preco: 11.9 },
  { codigo: 4, nome: "Donut Oreo", preco: 12.9 },
  { codigo: 5, nome: "Donut Pistache", preco: 14.9 },
  { codigo: 6, nome: "Café Espresso", preco: 7.5 },
  { codigo: 7, nome: "Cappuccino", preco: 12.0 },
  { codigo: 8, nome: "Café com Leite", preco: 9.0 },
  { codigo: 9, nome: "Chocolate Quente", preco: 13.0 },
  { codigo: 10, nome: "Salgado Misto Quente", preco: 9.5 },
  { codigo: 11, nome: "Coxinha", preco: 8.0 },
  { codigo: 12, nome: "Pão de Queijo (3un)", preco: 10.0 },
  { codigo: 13, nome: "Combo Donut + Café", preco: 16.9 },
  { codigo: 14, nome: "Combo Família (6 Donuts)", preco: 44.9 },
];

// ---------------------------------------------------------------------------
// Prêmios da roleta
// ---------------------------------------------------------------------------

export const MOCK_PREMIOS: Premio[] = [
  {
    id: "premio_1",
    nome: "Donut Glazed Clássico",
    tipo: "produto",
    valor: 0,
    probabilidade: 15,
    posicao_roleta: 1,
    ativo: true,
    limite_diario: 20,
    limite_mensal: null,
    cor_fatia: "#e6398f",
    icone: "🍩",
  },
  {
    id: "premio_2",
    nome: "10% de Desconto",
    tipo: "desconto",
    valor: 10,
    probabilidade: 20,
    posicao_roleta: 2,
    ativo: true,
    limite_diario: null,
    limite_mensal: null,
    cor_fatia: "#f43f5e",
    icone: "💰",
  },
  {
    id: "premio_3",
    nome: "Café Expresso Grátis",
    tipo: "produto",
    valor: 0,
    probabilidade: 15,
    posicao_roleta: 3,
    ativo: true,
    limite_diario: 15,
    limite_mensal: null,
    cor_fatia: "#d97706",
    icone: "☕",
  },
  {
    id: "premio_4",
    nome: "15% de Desconto",
    tipo: "desconto",
    valor: 15,
    probabilidade: 10,
    posicao_roleta: 4,
    ativo: true,
    limite_diario: null,
    limite_mensal: null,
    cor_fatia: "#8b5cf6",
    icone: "🎉",
  },
  {
    id: "premio_5",
    nome: "Donut Chocolate Belga",
    tipo: "produto",
    valor: 0,
    probabilidade: 10,
    posicao_roleta: 5,
    ativo: true,
    limite_diario: 10,
    limite_mensal: null,
    cor_fatia: "#ec4899",
    icone: "🍫",
  },
  {
    id: "premio_6",
    nome: "5% de Desconto",
    tipo: "desconto",
    valor: 5,
    probabilidade: 15,
    posicao_roleta: 6,
    ativo: true,
    limite_diario: null,
    limite_mensal: null,
    cor_fatia: "#10b981",
    icone: "🏷️",
  },
  {
    id: "premio_7",
    nome: "Capuccino Pequeno",
    tipo: "produto",
    valor: 0,
    probabilidade: 5,
    posicao_roleta: 7,
    ativo: true,
    limite_diario: 5,
    limite_mensal: null,
    cor_fatia: "#3b82f6",
    icone: "🥤",
  },
  {
    id: "premio_8",
    nome: "20% de Desconto VIP",
    tipo: "desconto",
    valor: 20,
    probabilidade: 3,
    posicao_roleta: 8,
    ativo: true,
    limite_diario: 3,
    limite_mensal: null,
    cor_fatia: "#ef4444",
    icone: "🌟",
  },
  {
    id: "premio_9",
    nome: "Mini Donut Recheado",
    tipo: "produto",
    valor: 0,
    probabilidade: 5,
    posicao_roleta: 9,
    ativo: true,
    limite_diario: 10,
    limite_mensal: null,
    cor_fatia: "#6366f1",
    icone: "🧁",
  },
  {
    id: "premio_10",
    nome: "Tente Novamente",
    tipo: "desconto",
    valor: 0,
    probabilidade: 2,
    posicao_roleta: 10,
    ativo: true,
    limite_diario: null,
    limite_mensal: null,
    cor_fatia: "#6b7280",
    icone: "🔄",
  },
];

// ---------------------------------------------------------------------------
// Configurações padrão
// ---------------------------------------------------------------------------

export const MOCK_CONFIG: Config[] = [
  { chave: "otp_whatsapp_ativo", valor: "false" },
  { chave: "janela_vinculo_min", valor: "10" },
  { chave: "modo_vinculo", valor: "caixa" },
  { chave: "validade_cupom_dias", valor: "7" },
  { chave: "lgpd_texto_versao", valor: "1.0" },
  {
    chave: "lgpd_texto",
    valor:
      "Ao preencher este cadastro, você autoriza a Melhor Bocado a armazenar seus dados pessoais (nome, WhatsApp e data de nascimento) para fins de comunicação de promoções, programas de fidelidade e relacionamento. Seus dados não serão compartilhados com terceiros. Você pode solicitar a exclusão dos seus dados a qualquer momento.",
  },
];

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Base de Clientes (Iniciada limpa para dados 100% reais gerados pela operação)
// ---------------------------------------------------------------------------

export const MOCK_CLIENTES_FIDELIDADE: Cliente[] = [];

// ---------------------------------------------------------------------------
// Função para gerar vendas simuladas do "Degust"
// ---------------------------------------------------------------------------

function gerarVendaSimulada(
  loja: string,
  caixa: string,
  minutosAtras: number
): VendaPDV {
  const qtdItens = randomBetween(1, 4);
  const itens: VendaItem[] = [];
  let valorTotal = 0;

  for (let i = 0; i < qtdItens; i++) {
    const produto =
      PRODUTOS_CARDAPIO[randomBetween(0, PRODUTOS_CARDAPIO.length - 1)];
    const quantidade = randomBetween(1, 3);
    const itemTotal = produto.preco * quantidade;
    valorTotal += itemTotal;
    itens.push({
      produto_codigo: produto.codigo,
      produto_nome: produto.nome,
      quantidade,
      valor_unitario: produto.preco,
      valor_total: Number(itemTotal.toFixed(2)),
    });
  }

  return {
    numero_venda: randomBetween(1000, 9999),
    loja,
    caixa,
    operador: "Operador 1",
    data_hora: minutesAgo(minutosAtras),
    valor_total: Number(valorTotal.toFixed(2)),
    forma_pagamento: ["Dinheiro", "Crédito", "Débito", "Pix"][
      randomBetween(0, 3)
    ],
    itens,
  };
}

export const MOCK_TRILHA_VISITAS: import("./types").EtapaTrilhaVisita[] = [
  {
    visita: 1,
    titulo: "Boas-Vindas",
    modo: "fixo",
    premio_fixo: {
      nome: "Café Expresso Grátis",
      tipo: "produto",
      valor: 0,
      icone: "☕",
      cor: "#4a2810",
    },
    descricao: "Ganhe 1 Café Expresso Grátis no seu 1º pedido!",
    ativo: true,
  },
  {
    visita: 2,
    titulo: "Roleta da Sorte",
    modo: "roleta",
    descricao: "Gire a roleta da sorte e concorra a prêmios e descontos!",
    ativo: true,
  },
  {
    visita: 3,
    titulo: "Cliente Frequente",
    modo: "fixo",
    premio_fixo: {
      nome: "10% de Desconto",
      tipo: "desconto",
      valor: 10,
      icone: "💰",
      cor: "#e6398f",
    },
    descricao: "10% de desconto garantido no seu pedido!",
    ativo: true,
  },
  {
    visita: 4,
    titulo: "Roleta da Sorte",
    modo: "roleta",
    descricao: "Gire a roleta e concorra a donuts e doces artesanais!",
    ativo: true,
  },
  {
    visita: 5,
    titulo: "Marco de 5 Visitas",
    modo: "fixo",
    premio_fixo: {
      nome: "Donut Glazed Clássico",
      tipo: "produto",
      valor: 0,
      icone: "🍩",
      cor: "#d97706",
    },
    descricao: "Parabéns por 5 visitas! Escolha 1 Donut Clássico!",
    ativo: true,
  },
  {
    visita: 6,
    titulo: "Roleta da Sorte",
    modo: "roleta",
    descricao: "Gire a roleta premiada de confeitaria!",
    ativo: true,
  },
  {
    visita: 7,
    titulo: "Quase VIP",
    modo: "fixo",
    premio_fixo: {
      nome: "15% de Desconto",
      tipo: "desconto",
      valor: 15,
      icone: "🎉",
      cor: "#8b5cf6",
    },
    descricao: "15% de desconto especial para clientes recorrentes!",
    ativo: true,
  },
  {
    visita: 8,
    titulo: "Roleta da Sorte",
    modo: "roleta",
    descricao: "Gire a roleta da sorte e concorra a prêmios especiais!",
    ativo: true,
  },
  {
    visita: 9,
    titulo: "Super Fiel",
    modo: "fixo",
    premio_fixo: {
      nome: "Capuccino Especial",
      tipo: "produto",
      valor: 0,
      icone: "🧋",
      cor: "#059669",
    },
    descricao: "Bebida quente artesanal à sua escolha!",
    ativo: true,
  },
  {
    visita: 10,
    titulo: "VIP Master 10ª Visita",
    modo: "fixo",
    premio_fixo: {
      nome: "Donut Recheado Especial VIP",
      tipo: "produto",
      valor: 0,
      icone: "👑",
      cor: "#f59e0b",
    },
    descricao: "Você é VIP Master! Donut Especial Recheado Grátis!",
    ativo: true,
  },
];

// ---------------------------------------------------------------------------
// Stores mutáveis com persistência em globalThis (compatível com Server e Client)
// ---------------------------------------------------------------------------

import {
  carregarSnapshotDisco,
  salvarSnapshotDisco,
  salvarClienteSupabase,
  salvarGiroSupabase,
  salvarCupomSupabase,
  sincronizarDoSupabase,
} from "./persistencia";

const snapshot = typeof window === "undefined" ? carregarSnapshotDisco() : null;

const globalForFidelidade = globalThis as unknown as {
  __mb_vendaStore?: Venda[];
  __mb_codigoVinculoStore?: CodigoVinculo[];
  __mb_giroStore?: Giro[];
  __mb_cupomStore?: Cupom[];
  __mb_clienteStore?: Cliente[];
  __mb_premiosRoletaStore?: Premio[];
  __mb_trilhaStore?: import("./types").EtapaTrilhaVisita[];
  __mb_automacaoLogStore?: AutomacaoLog[];
  __mb_unidadesStore?: import("./types").UnidadeLoja[];
  __mb_supabaseHydrated?: boolean;
};

/** Vendas sincronizadas do "Degust" */
export const vendaStore = (globalForFidelidade.__mb_vendaStore ??= []);

/** Códigos de vínculo ativos */
export const codigoVinculoStore = (globalForFidelidade.__mb_codigoVinculoStore ??= snapshot?.codigos ?? []);

/** Giros realizados */
export const giroStore = (globalForFidelidade.__mb_giroStore ??= snapshot?.giros ?? []);

/** Cupons emitidos */
export const cupomStore = (globalForFidelidade.__mb_cupomStore ??= snapshot?.cupons ?? []);

/** Clientes (mutável — persistido em disco e Supabase) */
export const clienteStore = (globalForFidelidade.__mb_clienteStore ??= snapshot?.clientes ?? []);

/** Prêmios mutáveis da roleta */
export let premiosRoletaStore = (globalForFidelidade.__mb_premiosRoletaStore ??= snapshot?.premios ?? [...MOCK_PREMIOS]);

/** Trilha de visitas mutável (flexível com N etapas) */
export let trilhaStore: import("./types").EtapaTrilhaVisita[] = (globalForFidelidade.__mb_trilhaStore ??= snapshot?.trilha ?? JSON.parse(JSON.stringify(MOCK_TRILHA_VISITAS)));

/** Log de automações */
export const automacaoLogStore = (globalForFidelidade.__mb_automacaoLogStore ??= []);

/** Lojas e franquias cadastradas no sistema */
export let unidadesStore: import("./types").UnidadeLoja[] = (globalForFidelidade.__mb_unidadesStore ??= snapshot?.unidades ?? [
  { id: "tatuape", nome: "Tatuapé", cidade: "São Paulo - SP", bairro: "Tatuapé", ativa: true, caixas: ["Caixa 01", "Caixa 02", "Totem Autoatendimento"] },
  { id: "mooca", nome: "Mooca", cidade: "São Paulo - SP", bairro: "Mooca", ativa: true, caixas: ["Caixa 01", "Caixa 02"] },
  { id: "campo_belo", nome: "Campo Belo", cidade: "São Paulo - SP", bairro: "Campo Belo", ativa: true, caixas: ["Caixa 01"] },
  { id: "santana", nome: "Santana", cidade: "São Paulo - SP", bairro: "Santana", ativa: true, caixas: ["Caixa 01", "Caixa 02"] },
  { id: "santo_amaro", nome: "Santo Amaro", cidade: "São Paulo - SP", bairro: "Santo Amaro", ativa: true, caixas: ["Caixa 01"] },
]);

export function salvarDB() {
  if (typeof window === "undefined") {
    salvarSnapshotDisco({
      clientes: clienteStore,
      giros: giroStore,
      cupons: cupomStore,
      codigos: codigoVinculoStore,
      unidades: unidadesStore,
      trilha: trilhaStore,
      premios: premiosRoletaStore,
      atualizado_em: new Date().toISOString(),
    });
  }
}

// Hidratação em background a partir do Supabase Postgres
if (typeof window === "undefined" && !globalForFidelidade.__mb_supabaseHydrated) {
  globalForFidelidade.__mb_supabaseHydrated = true;
  sincronizarDoSupabase()
    .then((data) => {
      if (data) {
        if (data.clientes.length > 0) {
          for (const c of data.clientes) {
            const zap = (c.whatsapp || c.celular || "").replace(/\D/g, "");
            if (!clienteStore.some((existing) => (existing.whatsapp || existing.celular || "").replace(/\D/g, "") === zap)) {
              clienteStore.push(c);
            }
          }
        }
        if (data.giros.length > 0) {
          for (const g of data.giros) {
            if (!giroStore.some((existing) => existing.id === g.id)) {
              giroStore.push(g);
            }
          }
        }
        if (data.cupons.length > 0) {
          for (const cup of data.cupons) {
            if (!cupomStore.some((existing) => existing.codigo_cupom === cup.codigo_cupom)) {
              cupomStore.push(cup);
            }
          }
        }
        salvarDB();
      }
    })
    .catch(() => {});
}

// ---------------------------------------------------------------------------
// Funções de Gestão de Lojas & Franquias
// ---------------------------------------------------------------------------

export function listarUnidades(): import("./types").UnidadeLoja[] {
  return [...unidadesStore];
}

export function cadastrarUnidade(dados: {
  nome: string;
  cidade: string;
  bairro?: string;
  endereco?: string;
  telefone?: string;
  caixas?: string[];
  id?: string;
}): import("./types").UnidadeLoja {
  const slugId = (dados.id || dados.nome)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/^_+|_+$/g, "") || `loja_${Date.now()}`;

  // Se já existe com esse ID, adiciona timestamp
  const existe = unidadesStore.some((u) => u.id === slugId);
  const finalId = existe ? `${slugId}_${Date.now().toString(36)}` : slugId;

  const novaUnidade: import("./types").UnidadeLoja = {
    id: finalId,
    nome: dados.nome,
    cidade: dados.cidade || "São Paulo - SP",
    bairro: dados.bairro || "",
    endereco: dados.endereco || "",
    telefone: dados.telefone || "",
    caixas: dados.caixas && dados.caixas.length > 0 ? dados.caixas : ["Caixa 01"],
    ativa: true,
  };

  unidadesStore.push(novaUnidade);
  return novaUnidade;
}

export function atualizarUnidade(
  id: string,
  dados: Partial<import("./types").UnidadeLoja>
): import("./types").UnidadeLoja | null {
  const idx = unidadesStore.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  unidadesStore[idx] = { ...unidadesStore[idx], ...dados };
  return unidadesStore[idx];
}

export function removerUnidade(id: string): boolean {
  if (unidadesStore.length <= 1) return false; // Impede remover a última loja
  const idx = unidadesStore.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  unidadesStore.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Funções de acesso à Trilha de Visitas (Flexível N Etapas)
// ---------------------------------------------------------------------------

export function listarTrilhaVisitas(): import("./types").EtapaTrilhaVisita[] {
  return [...trilhaStore].sort((a, b) => a.visita - b.visita);
}

export function obterConfiguracaoVisita(visitaNumero: number): import("./types").EtapaTrilhaVisita {
  const etapas = listarTrilhaVisitas();
  if (etapas.length === 0) {
    return MOCK_TRILHA_VISITAS[0];
  }
  // Tenta encontrar a etapa exata
  const etapaExata = etapas.find((t) => t.visita === visitaNumero);
  if (etapaExata) return etapaExata;

  // Se a visita for maior que a trilha configurada (ex: cliente na 12ª visita e trilha tem 10),
  // ele permanece na última etapa VIP ou faz loop suave
  const ultimaEtapa = etapas[etapas.length - 1];
  return ultimaEtapa || etapas[0];
}

export function atualizarEtapaTrilha(
  visita: number,
  dados: Partial<import("./types").EtapaTrilhaVisita>
): { sucesso: boolean; etapa?: import("./types").EtapaTrilhaVisita; erro?: string } {
  const index = trilhaStore.findIndex((t: import("./types").EtapaTrilhaVisita) => t.visita === visita);
  if (index === -1) {
    return { sucesso: false, erro: "Etapa da visita não encontrada." };
  }
  trilhaStore[index] = {
    ...trilhaStore[index],
    ...dados,
  };
  salvarDB();
  return { sucesso: true, etapa: trilhaStore[index] };
}

export function salvarTrilhaCompleta(
  novaTrilha: import("./types").EtapaTrilhaVisita[]
): { sucesso: boolean; trilha: import("./types").EtapaTrilhaVisita[] } {
  if (Array.isArray(novaTrilha) && novaTrilha.length >= 1) {
    // Reindexa as visitas sequencialmente de 1 a N
    const reindexada = novaTrilha.map((etapa, idx) => ({
      ...etapa,
      visita: idx + 1,
    }));
    trilhaStore.length = 0;
    trilhaStore.push(...reindexada);
    salvarDB();
    return { sucesso: true, trilha: listarTrilhaVisitas() };
  }
  return { sucesso: false, trilha: listarTrilhaVisitas() };
}

export function resetarTrilhaPadrao(): import("./types").EtapaTrilhaVisita[] {
  trilhaStore.length = 0;
  trilhaStore.push(...JSON.parse(JSON.stringify(MOCK_TRILHA_VISITAS)));
  salvarDB();
  return listarTrilhaVisitas();
}

export function listarPremios(): Premio[] {
  return [...premiosRoletaStore].sort((a, b) => a.posicao_roleta - b.posicao_roleta);
}

export function atualizarPremio(id: string, dados: Partial<Premio>): { sucesso: boolean; premio?: Premio; erro?: string } {
  const index = premiosRoletaStore.findIndex((p) => p.id === id);
  if (index === -1) {
    return { sucesso: false, erro: "Prêmio não encontrado." };
  }

  premiosRoletaStore[index] = {
    ...premiosRoletaStore[index],
    ...dados,
  };

  salvarDB();
  return { sucesso: true, premio: premiosRoletaStore[index] };
}

export function resetarPremiosPadrao(): Premio[] {
  premiosRoletaStore = [...MOCK_PREMIOS];
  return listarPremios();
}

export function limparTudo() {
  vendaStore.length = 0;
  codigoVinculoStore.length = 0;
  giroStore.length = 0;
  cupomStore.length = 0;
  clienteStore.length = 0;
  automacaoLogStore.length = 0;
  premiosRoletaStore = [...MOCK_PREMIOS];
  trilhaStore.length = 0;
  trilhaStore.push(...JSON.parse(JSON.stringify(MOCK_TRILHA_VISITAS)));
}

export function buscarClientePorWhatsapp(
  whatsapp: string
): Cliente | undefined {
  const normalizado = whatsapp.replace(/\D/g, "");
  if (!normalizado) return undefined;
  
  // 1. Busca no clienteStore
  const cliente = clienteStore.find(
    (c) => (c.whatsapp || c.celular || "").replace(/\D/g, "") === normalizado
  );
  if (cliente) return cliente;

  // 2. Fallback inteligente: se houver cupom com este zap, reconstrói o perfil
  const cup = cupomStore.find(
    (c) => (c.cliente_whatsapp || "").replace(/\D/g, "") === normalizado
  );
  if (cup) {
    const novoCli: Cliente = {
      id: cup.cliente_id || `cli_${cup.id}`,
      nome: cup.cliente_nome || "Cliente",
      whatsapp: cup.cliente_whatsapp || normalizado,
      nascimento: cup.cliente_nascimento || "",
      celular: cup.cliente_whatsapp || normalizado,
      canal_aquisicao: "roleta_qrcode",
      aceite_lgpd: true,
      aceite_lgpd_em: cup.criado_em,
      aceite_lgpd_texto_versao: "1.0",
      criado_em: cup.criado_em,
      primeira_compra_em: cup.criado_em,
      ultima_compra_em: cup.criado_em,
      total_gasto: 0,
      ticket_medio: 0,
      qtd_compras: cup.visita_numero || 1,
      loja_preferida: cup.unidade,
      horario_preferido: null,
      ltv: 0,
      vip: false,
    };
    clienteStore.push(novoCli);
    salvarDB();
    return novoCli;
  }

  return undefined;
}

export function cadastrarCliente(dados: Omit<Cliente, "id" | "criado_em" | "primeira_compra_em" | "ultima_compra_em" | "total_gasto" | "ticket_medio" | "qtd_compras" | "loja_preferida" | "horario_preferido" | "ltv" | "vip">): Cliente {
  const novoCliente: Cliente = {
    ...dados,
    id: `cli_${id()}`,
    criado_em: new Date().toISOString(),
    primeira_compra_em: new Date().toISOString(),
    ultima_compra_em: new Date().toISOString(),
    total_gasto: 0,
    ticket_medio: 0,
    qtd_compras: 1,
    loja_preferida: dados.unidade_cadastro || null,
    horario_preferido: null,
    ltv: 0,
    vip: false,
  };
  clienteStore.push(novoCliente);
  salvarDB();
  return novoCliente;
}

/**
 * Deduplicação Inteligente:
 * 1. Busca por WhatsApp/Celular normalizado (apenas dígitos)
 * 2. Se não encontrou celular, busca por Nome Completo + Data de Nascimento
 * 3. Se não encontrou, cadastra novo cliente sem duplicar
 */
export function buscarOuCriarClienteIdentificado(
  nome: string,
  nascimento: string,
  whatsapp: string,
  unidade: string,
  visitorId?: string
): { cliente: Cliente; ehNovoCliente: boolean; visitaNumero: number } {
  const nomeClean = nome.trim().toLowerCase();
  const nascClean = nascimento.trim();
  const zapClean = whatsapp.replace(/\D/g, "");

  // 1. Chave mestre de deduplicação: Celular/WhatsApp
  let cliente = zapClean ? buscarClientePorWhatsapp(zapClean) : undefined;

  // 2. Se não achou por WhatsApp, busca por Nome Completo + Data de Nascimento
  if (!cliente && nomeClean && nascClean) {
    cliente = clienteStore.find(
      (c) =>
        c.nome.trim().toLowerCase() === nomeClean &&
        c.nascimento.trim() === nascClean
    );
  }

  // 3. Fallback por visitorId se aplicável
  if (!cliente && visitorId) {
    cliente = clienteStore.find((c) => c.id === visitorId);
  }

  if (cliente) {
    cliente.qtd_compras = (cliente.qtd_compras || 1) + 1;
    cliente.ultima_compra_em = new Date().toISOString();
    if (zapClean && (!cliente.whatsapp || cliente.whatsapp !== zapClean)) {
      cliente.whatsapp = zapClean;
      cliente.celular = zapClean;
    }
    if (nome.trim() && cliente.nome !== nome.trim()) {
      cliente.nome = nome.trim();
    }
    if (nascClean && cliente.nascimento !== nascClean) {
      cliente.nascimento = nascClean;
    }
    salvarDB();
    salvarClienteSupabase(cliente).catch(() => {});
    const visitaNumero = calcularNumeroVisita(visitorId || "", cliente.id);
    return { cliente, ehNovoCliente: false, visitaNumero };
  }

  // 4. Cria novo perfil individual
  const novoCliente = cadastrarCliente({
    nome: nome.trim(),
    nascimento: nascClean,
    whatsapp: zapClean,
    celular: zapClean,
    canal_aquisicao: "roleta_qrcode",
    aceite_lgpd: true,
    aceite_lgpd_em: new Date().toISOString(),
    aceite_lgpd_texto_versao: "1.0",
    unidade_cadastro: unidade,
  });
  salvarClienteSupabase(novoCliente).catch(() => {});

  const visitaNumero = calcularNumeroVisita(visitorId || "", novoCliente.id);
  return { cliente: novoCliente, ehNovoCliente: true, visitaNumero };
}

/** Gerador de Código de Vínculo / QR Code de uso único */
export function gerarCodigoVinculo(loja: string, caixa: string): CodigoVinculo {
  // Código aleatório de 4 dígitos ou alfanumérico amigável
  const randomNum = randomBetween(1000, 9999);
  const prefixoLoja = loja.slice(0, 3).toUpperCase();
  const codigoFormatado = `${randomNum}`;

  const codigo: CodigoVinculo = {
    id: `cv_${id()}`,
    codigo: codigoFormatado,
    loja,
    caixa,
    criado_em: new Date().toISOString(),
    expira_em: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60 min de validade
    status: "aguardando",
  };
  codigoVinculoStore.push(codigo);
  return codigo;
}

export function buscarCodigoVinculo(codigo: string, loja?: string): CodigoVinculo | undefined {
  const codeFormatted = codigo.trim().toUpperCase();
  return codigoVinculoStore.find(
    (cv) =>
      cv.codigo.toUpperCase() === codeFormatted &&
      (!loja || cv.loja === loja || loja === "todas")
  );
}

export function buscarCodigoVinculoAtivo(
  codigo: string,
  loja?: string
): CodigoVinculo | undefined {
  const cv = buscarCodigoVinculo(codigo, loja);
  if (!cv) return undefined;
  if (cv.status !== "aguardando") return undefined;
  if (new Date(cv.expira_em) <= new Date()) {
    cv.status = "expirado";
    return undefined;
  }
  return cv;
}

/** Consumo atômico do QR code / código de vínculo - TRAVA ANTIFRAUDE */
export function consumirCodigoVinculo(
  codigo: string,
  loja?: string,
  clienteId?: string
): { sucesso: boolean; motivo?: "codigo_invalido" | "ja_utilizado" | "expirado"; codigoVinculo?: CodigoVinculo } {
  const cv = buscarCodigoVinculo(codigo, loja);

  if (!cv) {
    return { sucesso: false, motivo: "codigo_invalido" };
  }

  if (cv.status === "utilizado") {
    return { sucesso: false, motivo: "ja_utilizado", codigoVinculo: cv };
  }

  if (new Date(cv.expira_em) <= new Date()) {
    cv.status = "expirado";
    return { sucesso: false, motivo: "expirado", codigoVinculo: cv };
  }

  // Marca como consumido de forma atômica e irreversível
  cv.status = "utilizado";
  cv.utilizado_em = new Date().toISOString();
  cv.utilizado_por_cliente_id = clienteId || null;

  return { sucesso: true, codigoVinculo: cv };
}

/** Verifica se uma venda já teve giro (trava antifraude) */
export function vendaJaTemGiro(vendaId: string): boolean {
  return giroStore.some((g) => g.venda_id === vendaId);
}

export function calcularNumeroVisita(visitorId: string, clienteId: string | null): number {
  const girosAnteriores = giroStore.filter(
    (g) => (clienteId && g.cliente_id === clienteId) || (visitorId && g.visitor_id === visitorId)
  );
  return girosAnteriores.length + 1;
}

export function registrarGiro(
  visitorId: string,
  codigoVinculoId: string,
  premioId: string,
  vendaId: string | null = null,
  clienteId: string | null = null,
  unidade: string = "tatuape",
  clienteNome?: string,
  clienteNascimento?: string,
  clienteWhatsapp?: string
): Giro {
  const visita_numero = calcularNumeroVisita(visitorId, clienteId);
  const giro: Giro = {
    id: `giro_${id()}`,
    visitor_id: visitorId,
    cliente_id: clienteId,
    cliente_nome: clienteNome,
    cliente_nascimento: clienteNascimento,
    cliente_whatsapp: clienteWhatsapp,
    unidade,
    visita_numero,
    venda_id: vendaId,
    codigo_vinculo_id: codigoVinculoId,
    premio_id: premioId,
    criado_em: new Date().toISOString(),
  };
  giroStore.push(giro);
  salvarDB();
  salvarGiroSupabase(giro).catch(() => {});
  return giro;
}


export function criarCupom(
  visitorId: string,
  premioId: string,
  giroId: string,
  clienteId: string | null = null,
  unidade: string = "tatuape",
  visitaNumero: number = 1,
  clienteNome?: string,
  clienteNascimento?: string,
  clienteWhatsapp?: string,
  origem: "roleta" | "trilha_fixa" = "roleta"
): Cupom {
  const validadeDias = Number(
    MOCK_CONFIG.find((c) => c.chave === "validade_cupom_dias")?.valor || "7"
  );
  const cupom: Cupom = {
    id: `cup_${id()}`,
    visitor_id: visitorId,
    cliente_id: clienteId,
    cliente_nome: clienteNome,
    cliente_nascimento: clienteNascimento,
    cliente_whatsapp: clienteWhatsapp,
    unidade,
    visita_numero: visitaNumero,
    premio_id: premioId,
    giro_id: giroId,
    origem,
    codigo_cupom: "MB-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    status: "disponivel",
    criado_em: new Date().toISOString(),
    expira_em: daysFromNow(validadeDias),
    utilizado_em: null,
  };
  cupomStore.push(cupom);
  salvarDB();
  salvarCupomSupabase(cupom).catch(() => {});
  return cupom;
}

export function listarCuponsDoCliente(identificador: string): Cupom[] {
  const idLimpo = (identificador || "").trim();
  const zapLimpo = idLimpo.replace(/\D/g, "");

  return cupomStore.filter((c) => {
    if (c.cliente_id && c.cliente_id === idLimpo) return true;
    if (zapLimpo && c.cliente_whatsapp) {
      const cZap = c.cliente_whatsapp.replace(/\D/g, "");
      if (cZap === zapLimpo || cZap.includes(zapLimpo) || zapLimpo.includes(cZap)) return true;
    }
    return false;
  });
}

export function buscarCupomPorId(cupomId: string): Cupom | undefined {
  return cupomStore.find((c) => c.id === cupomId);
}

export function buscarCupomPorCodigo(codigoCupom: string): Cupom | undefined {
  const codeFormatted = codigoCupom.trim().toUpperCase();
  return cupomStore.find(
    (c) => c.codigo_cupom.toUpperCase() === codeFormatted || c.codigo_cupom.replace("MB-", "").toUpperCase() === codeFormatted
  );
}

export function resgatarCupomPorBalconista(codigoCupom: string, balconista: string = "caixa_1", unidade?: string): { sucesso: boolean; mensagem: string; cupom?: Cupom } {
  const cupom = buscarCupomPorCodigo(codigoCupom);
  if (!cupom) {
    return { sucesso: false, mensagem: "Cupom não encontrado." };
  }
  if (cupom.status === "utilizado") {
    return { sucesso: false, mensagem: "Este cupom já foi utilizado anteriormente.", cupom };
  }
  if (new Date(cupom.expira_em) < new Date()) {
    cupom.status = "expirado";
    salvarDB();
    salvarCupomSupabase(cupom).catch(() => {});
    return { sucesso: false, mensagem: "Este cupom está expirado.", cupom };
  }

  cupom.status = "utilizado";
  cupom.utilizado_em = new Date().toISOString();
  cupom.balconista_resgatou = balconista;
  if (unidade) {
    cupom.unidade = unidade;
  }

  salvarDB();
  salvarCupomSupabase(cupom).catch(() => {});
  return { sucesso: true, mensagem: "Cupom resgatado com sucesso!", cupom };
}

export function buscarPremioPorId(premioId: string): Premio | undefined {
  if (premioId && premioId.startsWith("trilha_fixo_")) {
    const visita = Number(premioId.replace("trilha_fixo_", ""));
    const etapa = obterConfiguracaoVisita(visita);
    if (etapa && etapa.premio_fixo) {
      return {
        id: premioId,
        nome: etapa.premio_fixo.nome,
        tipo: etapa.premio_fixo.tipo,
        valor: etapa.premio_fixo.valor,
        probabilidade: 100,
        posicao_roleta: 1,
        ativo: true,
        limite_diario: null,
        limite_mensal: null,
        cor_fatia: etapa.premio_fixo.cor,
        icone: etapa.premio_fixo.icone,
      };
    }
  }

  const found = premiosRoletaStore.find((p) => p.id === premioId);
  if (found) return found;

  for (const etapa of trilhaStore) {
    if (etapa.premios_roleta && Array.isArray(etapa.premios_roleta)) {
      const foundEtapa = etapa.premios_roleta.find((p) => p.id === premioId);
      if (foundEtapa) return foundEtapa;
    }
  }

  return undefined;
}

export function getConfig(chave: string): string | undefined {
  return MOCK_CONFIG.find((c) => c.chave === chave)?.valor;
}

// ---------------------------------------------------------------------------
// Gerador de vendas para o MockAdapter
// ---------------------------------------------------------------------------

/** Gera N vendas simuladas dos últimos X minutos */
export function gerarVendasRecentes(
  loja: string,
  caixa: string,
  quantidade: number = 5,
  dentroDeMinutos: number = 30
): VendaPDV[] {
  const vendas: VendaPDV[] = [];
  for (let i = 0; i < quantidade; i++) {
    const minutosAtras = randomBetween(1, dentroDeMinutos);
    vendas.push(gerarVendaSimulada(loja, caixa, minutosAtras));
  }
  // Ordena por data (mais recente primeiro)
  return vendas.sort(
    (a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
  );
}

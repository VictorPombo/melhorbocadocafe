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
    nome: "Café Espresso Grátis",
    tipo: "produto",
    valor: 7.5,
    probabilidade: 30,
    ativo: true,
    limite_diario: 20,
    limite_mensal: null,
    imagem: null,
  },
  {
    id: "premio_2",
    nome: "10% de Desconto",
    tipo: "desconto",
    valor: 10,
    probabilidade: 25,
    ativo: true,
    limite_diario: null,
    limite_mensal: null,
    imagem: null,
  },
  {
    id: "premio_3",
    nome: "Donut Grátis",
    tipo: "produto",
    valor: 8.9,
    probabilidade: 15,
    ativo: true,
    limite_diario: 10,
    limite_mensal: 200,
    imagem: null,
  },
  {
    id: "premio_4",
    nome: "Pão de Queijo Grátis",
    tipo: "produto",
    valor: 10,
    probabilidade: 20,
    ativo: true,
    limite_diario: 15,
    limite_mensal: null,
    imagem: null,
  },
  {
    id: "premio_5",
    nome: "Combo Donut + Café",
    tipo: "produto",
    valor: 16.9,
    probabilidade: 5,
    ativo: true,
    limite_diario: 3,
    limite_mensal: 50,
    imagem: null,
  },
  {
    id: "premio_6",
    nome: "20% de Desconto",
    tipo: "desconto",
    valor: 20,
    probabilidade: 5,
    ativo: true,
    limite_diario: 5,
    limite_mensal: 100,
    imagem: null,
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
// Clientes mockados (pré-cadastrados para testes)
// ---------------------------------------------------------------------------

export const MOCK_CLIENTES_FIDELIDADE: Cliente[] = [
  {
    id: "cli_1",
    nome: "Maria Silva",
    whatsapp: "31999990001",
    nascimento: "1990-03-15",
    canal_aquisicao: "instagram",
    aceite_lgpd: true,
    aceite_lgpd_em: daysAgo(30),
    aceite_lgpd_texto_versao: "1.0",
    criado_em: daysAgo(30),
    primeira_compra_em: daysAgo(28),
    ultima_compra_em: daysAgo(1),
    total_gasto: 245.6,
    ticket_medio: 24.56,
    qtd_compras: 10,
    loja_preferida: "loja_1",
    horario_preferido: "14:00",
    ltv: 245.6,
    vip: true,
  },
  {
    id: "cli_2",
    nome: "João Santos",
    whatsapp: "31999990002",
    nascimento: "1985-07-22",
    canal_aquisicao: "indicacao",
    aceite_lgpd: true,
    aceite_lgpd_em: daysAgo(15),
    aceite_lgpd_texto_versao: "1.0",
    criado_em: daysAgo(15),
    primeira_compra_em: daysAgo(14),
    ultima_compra_em: daysAgo(3),
    total_gasto: 89.7,
    ticket_medio: 29.9,
    qtd_compras: 3,
    loja_preferida: "loja_1",
    horario_preferido: "09:00",
    ltv: 89.7,
    vip: false,
  },
  {
    id: "cli_3",
    nome: "Ana Oliveira",
    whatsapp: "31999990003",
    nascimento: "1995-12-01",
    canal_aquisicao: "passei_em_frente",
    aceite_lgpd: true,
    aceite_lgpd_em: daysAgo(60),
    aceite_lgpd_texto_versao: "1.0",
    criado_em: daysAgo(60),
    primeira_compra_em: daysAgo(58),
    ultima_compra_em: daysAgo(45),
    total_gasto: 52.8,
    ticket_medio: 26.4,
    qtd_compras: 2,
    loja_preferida: "loja_1",
    horario_preferido: "16:00",
    ltv: 52.8,
    vip: false,
  },
];

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

// ---------------------------------------------------------------------------
// Stores mutáveis (in-memory, simula o banco)
// ---------------------------------------------------------------------------

/** Vendas sincronizadas do "Degust" */
export const vendaStore: Venda[] = [];

/** Códigos de vínculo ativos */
export const codigoVinculoStore: CodigoVinculo[] = [];

/** Giros realizados */
export const giroStore: Giro[] = [];

/** Cupons emitidos */
export const cupomStore: Cupom[] = [];

/** Clientes (mutável — novos cadastros entram aqui) */
export const clienteStore: Cliente[] = [...MOCK_CLIENTES_FIDELIDADE];

/** Log de automações */
export const automacaoLogStore: AutomacaoLog[] = [];

// ---------------------------------------------------------------------------
// Funções de acesso aos stores (simula queries no banco)
// ---------------------------------------------------------------------------

export function buscarClientePorWhatsapp(
  whatsapp: string
): Cliente | undefined {
  // Normaliza: remove tudo que não é número
  const normalizado = whatsapp.replace(/\D/g, "");
  return clienteStore.find(
    (c) => c.whatsapp.replace(/\D/g, "") === normalizado
  );
}

export function cadastrarCliente(dados: Omit<Cliente, "id" | "criado_em" | "primeira_compra_em" | "ultima_compra_em" | "total_gasto" | "ticket_medio" | "qtd_compras" | "loja_preferida" | "horario_preferido" | "ltv" | "vip">): Cliente {
  const novoCliente: Cliente = {
    ...dados,
    id: `cli_${id()}`,
    criado_em: new Date().toISOString(),
    primeira_compra_em: null,
    ultima_compra_em: null,
    total_gasto: 0,
    ticket_medio: 0,
    qtd_compras: 0,
    loja_preferida: null,
    horario_preferido: null,
    ltv: 0,
    vip: false,
  };
  clienteStore.push(novoCliente);
  return novoCliente;
}

export function gerarCodigoVinculo(loja: string, caixa: string): CodigoVinculo {
  // Expira códigos antigos do mesmo caixa
  codigoVinculoStore.forEach((cv) => {
    if (cv.loja === loja && cv.caixa === caixa && cv.status === "aguardando") {
      cv.status = "expirado";
    }
  });

  const codigo: CodigoVinculo = {
    id: `cv_${id()}`,
    codigo: String(randomBetween(1000, 9999)),
    loja,
    caixa,
    criado_em: new Date().toISOString(),
    expira_em: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    status: "aguardando",
  };
  codigoVinculoStore.push(codigo);
  return codigo;
}

export function buscarCodigoVinculoAtivo(
  codigo: string
): CodigoVinculo | undefined {
  return codigoVinculoStore.find(
    (cv) =>
      cv.codigo === codigo &&
      cv.status === "aguardando" &&
      new Date(cv.expira_em) > new Date()
  );
}

/** Verifica se uma venda já teve giro (trava antifraude) */
export function vendaJaTemGiro(vendaId: string): boolean {
  return giroStore.some((g) => g.venda_id === vendaId);
}

export function registrarGiro(
  clienteId: string,
  codigoVinculoId: string,
  premioId: string,
  vendaId: string | null
): Giro {
  const giro: Giro = {
    id: `giro_${id()}`,
    cliente_id: clienteId,
    venda_id: vendaId,
    codigo_vinculo_id: codigoVinculoId,
    premio_id: premioId,
    criado_em: new Date().toISOString(),
  };
  giroStore.push(giro);
  return giro;
}

export function criarCupom(
  clienteId: string,
  premioId: string,
  giroId: string
): Cupom {
  const validadeDias = Number(
    MOCK_CONFIG.find((c) => c.chave === "validade_cupom_dias")?.valor || "7"
  );
  const cupom: Cupom = {
    id: `cup_${id()}`,
    cliente_id: clienteId,
    premio_id: premioId,
    giro_id: giroId,
    codigo_cupom: Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: "disponivel",
    criado_em: new Date().toISOString(),
    expira_em: daysFromNow(validadeDias),
    utilizado_em: null,
  };
  cupomStore.push(cupom);
  return cupom;
}

export function listarCuponsDoCliente(clienteId: string): Cupom[] {
  return cupomStore.filter((c) => c.cliente_id === clienteId);
}

export function buscarCupomPorId(cupomId: string): Cupom | undefined {
  return cupomStore.find((c) => c.id === cupomId);
}

export function buscarPremioPorId(premioId: string): Premio | undefined {
  return MOCK_PREMIOS.find((p) => p.id === premioId);
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

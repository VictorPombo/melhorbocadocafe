// =============================================================================
// Tipos e interfaces do módulo Fidelidade + Captura Inteligente de Clientes
// =============================================================================

// ---------------------------------------------------------------------------
// Entidades do banco
// ---------------------------------------------------------------------------

export type CanalAquisicao =
  | "instagram"
  | "tiktok"
  | "google"
  | "ifood"
  | "indicacao"
  | "passei_em_frente"
  | "roleta_qrcode"
  | "outro";

export interface UnidadeLoja {
  id: string;
  nome: string;
  cidade: string;
  bairro?: string;
  endereco?: string;
  telefone?: string;
  caixas?: string[];
  ativa?: boolean;
}

export const UNIDADES_LOJA: UnidadeLoja[] = [
  { id: "tatuape", nome: "Tatuapé (Matriz)", cidade: "São Paulo - SP", bairro: "Tatuapé", ativa: true, caixas: ["Caixa 01", "Caixa 02", "Totem Autoatendimento"] },
  { id: "mooca", nome: "Mooca", cidade: "São Paulo - SP", bairro: "Mooca", ativa: true, caixas: ["Caixa 01", "Caixa 02"] },
  { id: "campo_belo", nome: "Campo Belo", cidade: "São Paulo - SP", bairro: "Campo Belo", ativa: true, caixas: ["Caixa 01"] },
  { id: "santana", nome: "Santana", cidade: "São Paulo - SP", bairro: "Santana", ativa: true, caixas: ["Caixa 01", "Caixa 02"] },
  { id: "santo_amaro", nome: "Santo Amaro", cidade: "São Paulo - SP", bairro: "Santo Amaro", ativa: true, caixas: ["Caixa 01"] },
];

export interface Cliente {
  id: string;
  nome: string;
  whatsapp?: string;
  celular?: string;
  nascimento: string;
  canal_aquisicao: CanalAquisicao;
  aceite_lgpd: boolean;
  aceite_lgpd_em: string;
  aceite_lgpd_texto_versao: string;
  criado_em: string;
  primeira_compra_em: string | null;
  ultima_compra_em: string | null;
  total_gasto: number;
  ticket_medio: number;
  qtd_compras: number;
  loja_preferida: string | null;
  horario_preferido: string | null;
  ltv: number;
  vip: boolean;
  unidade_cadastro?: string;
}

export interface CodigoVinculo {
  id: string;
  codigo: string;
  loja: string;
  caixa: string;
  criado_em: string;
  expira_em: string;
  status: "aguardando" | "utilizado" | "expirado";
  utilizado_em?: string | null;
  utilizado_por_cliente_id?: string | null;
}

export interface Venda {
  id: string;
  /** Número de controle do Degust (único por loja) */
  numero_venda: number;
  loja: string;
  caixa: string;
  operador: string | null;
  data_hora: string;
  valor_total: number;
  forma_pagamento: string | null;
  /** JSON com itens da venda */
  itens: VendaItem[];
  ticket: number;
  cliente_id: string | null;
  /** Como a venda foi sincronizada: "api" | "mock" */
  origem_sync: string;
}

export interface VendaItem {
  produto_codigo: number;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export interface Giro {
  id: string;
  visitor_id: string;
  cliente_id: string | null;
  cliente_nome?: string;
  cliente_nascimento?: string;
  cliente_whatsapp?: string;
  unidade: string;
  visita_numero: number;
  venda_id: string | null;
  codigo_vinculo_id: string;
  premio_id: string;
  criado_em: string;
}

export type TipoPremio = "produto" | "desconto" | "desconto_reais";

export interface Premio {
  id: string;
  nome: string;
  tipo: TipoPremio;
  /** Valor do desconto em reais ou porcentagem ou descrição do produto */
  valor: number;
  /** Probabilidade em porcentagem (0-100) */
  probabilidade: number;
  /** Posição da fatia na roleta de 1 a 10 */
  posicao_roleta: number;
  ativo: boolean;
  limite_diario: number | null;
  limite_mensal: number | null;
  cor_fatia: string;
  icone: string;
  imagem?: string | null;
}

export type StatusCupom = "disponivel" | "utilizado" | "expirado";

export type ModoVisita = "roleta" | "fixo";

export interface PremioFixoTrilha {
  nome: string;
  tipo: TipoPremio;
  valor: number;
  icone: string;
  cor: string;
}

export interface EtapaTrilhaVisita {
  visita: number; // 1 a 10
  titulo: string;
  modo: ModoVisita; // "roleta" ou "fixo"
  premio_fixo?: PremioFixoTrilha;
  premios_roleta?: Premio[]; // Roleta personalizada exclusiva desta etapa
  descricao: string;
  ativo: boolean;
}

export interface Cupom {
  id: string;
  visitor_id: string;
  cliente_id: string | null;
  cliente_nome?: string;
  cliente_nascimento?: string;
  cliente_whatsapp?: string;
  unidade: string;
  visita_numero: number;
  premio_id: string;
  giro_id: string;
  origem?: "roleta" | "trilha_fixa";
  /** Código alfanumérico do cupom exibido ao cliente */
  codigo_cupom: string;
  status: StatusCupom;
  criado_em: string;
  expira_em: string;
  utilizado_em: string | null;
  balconista_resgatou?: string | null;
  premio?: Premio | null;
}

export interface Config {
  chave: string;
  valor: string;
}

export type TipoAutomacao =
  | "aniversario"
  | "inativo"
  | "vip"
  | "primeira_compra";

export type StatusAutomacao = "enviado" | "erro" | "pendente";

export interface AutomacaoLog {
  id: string;
  tipo: TipoAutomacao;
  cliente_id: string;
  disparado_em: string;
  status: StatusAutomacao;
  detalhes: string | null;
}

// ---------------------------------------------------------------------------
// Interface de Integração de Vendas (Adaptador)
// ---------------------------------------------------------------------------

/** Dados mínimos de uma venda retornada pelo PDV */
export interface VendaPDV {
  numero_venda: number;
  loja: string;
  caixa: string;
  operador: string | null;
  data_hora: string;
  valor_total: number;
  forma_pagamento: string | null;
  itens: VendaItem[];
}

/**
 * Interface de integração com o PDV.
 * Toda comunicação com o Degust (ou outro PDV) passa por aqui.
 * O resto do sistema NUNCA chama o Degust diretamente.
 */
export interface IntegracaoVendas {
  /** Autentica na API do PDV e retorna true se OK */
  autenticar(): Promise<boolean>;

  /** Busca uma venda específica pelo número de controle */
  buscarVendaPorNumero(
    loja: string,
    numeroVenda: number
  ): Promise<VendaPDV | null>;

  /**
   * Lista vendas recentes de um caixa/terminal específico.
   * Usado para o casamento venda↔cliente por janela de tempo.
   */
  listarVendasRecentesDoCaixa(
    loja: string,
    caixa: string,
    desdeHorario: Date
  ): Promise<VendaPDV[]>;

  /**
   * Sincroniza todas as vendas novas desde o último timestamp.
   * Retorna as vendas que ainda não foram importadas.
   */
  sincronizarVendas(loja: string, desde: Date): Promise<VendaPDV[]>;
}

// ---------------------------------------------------------------------------
// Interface de Envio de Mensagem (WhatsApp / SMS)
// ---------------------------------------------------------------------------

export interface MensagemPayload {
  destinatario: string; // WhatsApp do cliente
  template: string;
  variaveis: Record<string, string>;
}

/**
 * Interface para envio de mensagens.
 * Provider plugável: mock agora, WhatsApp Business API depois.
 */
export interface EnvioMensagem {
  enviar(payload: MensagemPayload): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Modo de Vínculo (configurável)
// ---------------------------------------------------------------------------

/**
 * (A) "caixa" → vínculo por caixa + janela de tempo (padrão)
 * (B) "numero_venda" → cliente digita o nº do cupom/recibo
 */
export type ModoVinculo = "caixa" | "numero_venda";

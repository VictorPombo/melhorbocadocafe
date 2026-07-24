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
  | "outro";

export interface Cliente {
  id: string;
  nome: string;
  /** Chave de identidade — WhatsApp com DDD, sem +55 (ex: "31999998888") */
  whatsapp: string;
  nascimento: string; // YYYY-MM-DD
  canal_aquisicao: CanalAquisicao;
  aceite_lgpd: boolean;
  aceite_lgpd_em: string | null;
  aceite_lgpd_texto_versao: string | null;
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
}

export type StatusCodigoVinculo = "aguardando" | "usado" | "expirado";

export interface CodigoVinculo {
  id: string;
  /** Código de 4 dígitos exibido ao cliente */
  codigo: string;
  loja: string;
  caixa: string;
  criado_em: string;
  expira_em: string;
  status: StatusCodigoVinculo;
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
  cliente_id: string;
  /** Pode ser null se a venda ainda não foi casada (vínculo pendente) */
  venda_id: string | null;
  codigo_vinculo_id: string;
  premio_id: string;
  criado_em: string;
}

export type TipoPremio = "produto" | "desconto";

export interface Premio {
  id: string;
  nome: string;
  tipo: TipoPremio;
  /** Valor do desconto em reais ou descrição do produto */
  valor: number;
  /** Probabilidade em porcentagem (0-100) */
  probabilidade: number;
  ativo: boolean;
  limite_diario: number | null;
  limite_mensal: number | null;
  imagem: string | null;
}

export type StatusCupom = "disponivel" | "utilizado" | "expirado";

export interface Cupom {
  id: string;
  cliente_id: string;
  premio_id: string;
  giro_id: string;
  /** Código alfanumérico do cupom exibido ao cliente */
  codigo_cupom: string;
  status: StatusCupom;
  criado_em: string;
  expira_em: string;
  utilizado_em: string | null;
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

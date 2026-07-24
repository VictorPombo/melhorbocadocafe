export { calcSaudeUnidade, type SaudeResult } from "./health";
export { calcInsights, calcTendencias, type Insight, type Tendencia } from "./insights";
export { calcScoreCliente, calcAllScores, calcVIPs, calcClientesRisco, calcRecuperaveis, type ClienteScore, type ClienteRisco, type Recuperaveis } from "./clientes";
export { calcTopProdutos, calcAssociacoes, type ProdutoRank, type Associacao } from "./produtos";
export { calcOrigemClientes, type CanalStats } from "./marketing";
export { calcMeta, type MetaResult } from "./metas";
export { calcTimeline, type TimelineEvent } from "./timeline";
export { pctChange, fmt, todayISO } from "./utils";

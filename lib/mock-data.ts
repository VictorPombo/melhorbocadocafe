/**
 * Dados mockados para o painel CRM.
 * 25 clientes com aniversários + ~80 vendas com horários.
 */

export type CanalOrigem =
  | "instagram"
  | "google"
  | "indicacao"
  | "passou_em_frente"
  | "outros";

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  canalOrigem: CanalOrigem;
  criadoEm: string;
  aniversario: string; // "MM-DD"
}

export interface ItemVenda {
  produtoNome: string;
  quantidade: number;
  valorUnitario: number;
}

export interface Venda {
  id: string;
  clienteId: string;
  itens: ItemVenda[];
  valorTotal: number;
  criadoEm: string;
  horario: string; // "HH:MM"
}

const CANAL_LABELS: Record<CanalOrigem, string> = {
  instagram: "Instagram",
  google: "Google",
  indicacao: "Indicação",
  passou_em_frente: "Passou em frente",
  outros: "Outros",
};

export { CANAL_LABELS };

// ─── Meta ───────────────────────────────────────────────────────

export const MOCK_META = {
  mensal: 80000,
  semanal: 20000,
  diaria: 3200,
};

// ─── Clientes ───────────────────────────────────────────────────

function todayMMDD(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function thisWeekMMDD(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const MOCK_CLIENTES: Cliente[] = [
  { id: "c1", nome: "Ana Beatriz Silva", telefone: "(11) 99123-4567", canalOrigem: "instagram", criadoEm: "2025-03-15", aniversario: todayMMDD() },
  { id: "c2", nome: "Carlos Eduardo Santos", telefone: "(11) 98765-4321", canalOrigem: "google", criadoEm: "2025-04-02", aniversario: "11-08" },
  { id: "c3", nome: "Mariana Oliveira", telefone: "(11) 97654-3210", canalOrigem: "indicacao", criadoEm: "2025-04-18", aniversario: thisWeekMMDD(2) },
  { id: "c4", nome: "Rafael Mendes", telefone: "(11) 96543-2109", canalOrigem: "passou_em_frente", criadoEm: "2025-05-01", aniversario: "03-22" },
  { id: "c5", nome: "Juliana Costa", telefone: "(11) 95432-1098", canalOrigem: "instagram", criadoEm: "2025-05-10", aniversario: "07-15" },
  { id: "c6", nome: "Pedro Henrique Lima", telefone: "(11) 94321-0987", canalOrigem: "google", criadoEm: "2025-05-22", aniversario: "01-30" },
  { id: "c7", nome: "Fernanda Rodrigues", telefone: "(11) 93210-9876", canalOrigem: "instagram", criadoEm: "2025-06-01", aniversario: thisWeekMMDD(4) },
  { id: "c8", nome: "Lucas Almeida", telefone: "(11) 92109-8765", canalOrigem: "indicacao", criadoEm: "2025-06-08", aniversario: "09-12" },
  { id: "c9", nome: "Isabela Martins", telefone: "(11) 91098-7654", canalOrigem: "passou_em_frente", criadoEm: "2025-06-15", aniversario: "02-28" },
  { id: "c10", nome: "Thiago Ferreira", telefone: "(11) 90987-6543", canalOrigem: "instagram", criadoEm: "2025-07-01", aniversario: "12-05" },
  { id: "c11", nome: "Camila Nascimento", telefone: "(11) 98876-5432", canalOrigem: "google", criadoEm: "2025-07-12", aniversario: "04-18" },
  { id: "c12", nome: "Bruno Souza", telefone: "(11) 97765-4321", canalOrigem: "outros", criadoEm: "2025-07-20", aniversario: "08-25" },
  { id: "c13", nome: "Larissa Pereira", telefone: "(11) 96654-3210", canalOrigem: "instagram", criadoEm: "2025-08-03", aniversario: "06-10" },
  { id: "c14", nome: "Diego Barbosa", telefone: "(11) 95543-2109", canalOrigem: "indicacao", criadoEm: "2025-08-18", aniversario: "10-02" },
  { id: "c15", nome: "Patrícia Gomes", telefone: "(11) 94432-1098", canalOrigem: "passou_em_frente", criadoEm: "2025-09-01", aniversario: "05-14" },
  { id: "c16", nome: "Gustavo Ribeiro", telefone: "(11) 93321-0987", canalOrigem: "instagram", criadoEm: "2025-09-15", aniversario: thisWeekMMDD(1) },
  { id: "c17", nome: "Amanda Carvalho", telefone: "(11) 92210-9876", canalOrigem: "google", criadoEm: "2025-10-01", aniversario: "01-15" },
  { id: "c18", nome: "Felipe Araújo", telefone: "(11) 91109-8765", canalOrigem: "indicacao", criadoEm: "2025-10-20", aniversario: "07-08" },
  { id: "c19", nome: "Natália Duarte", telefone: "(11) 90098-7654", canalOrigem: "instagram", criadoEm: "2025-11-05", aniversario: "11-22" },
  { id: "c20", nome: "Rodrigo Teixeira", telefone: "(11) 99887-6543", canalOrigem: "passou_em_frente", criadoEm: "2025-11-18", aniversario: "03-05" },
  { id: "c21", nome: "Bianca Monteiro", telefone: "(11) 98776-5432", canalOrigem: "instagram", criadoEm: "2025-12-01", aniversario: "09-30" },
  { id: "c22", nome: "André Vieira", telefone: "(11) 97665-4321", canalOrigem: "google", criadoEm: "2025-12-15", aniversario: "12-20" },
  { id: "c23", nome: "Carolina Freitas", telefone: "(11) 96554-3210", canalOrigem: "indicacao", criadoEm: "2026-01-08", aniversario: "04-02" },
  { id: "c24", nome: "Matheus Correia", telefone: "(11) 95443-2109", canalOrigem: "instagram", criadoEm: "2026-01-22", aniversario: "08-11" },
  { id: "c25", nome: "Renata Campos", telefone: "(11) 94332-1098", canalOrigem: "outros", criadoEm: "2026-02-05", aniversario: "02-14" },
];

// ─── Vendas ─────────────────────────────────────────────────────

function d(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

const H = [
  "08:15","08:45","09:10","09:30","10:00","10:20","10:45","11:00","11:30",
  "12:00","12:15","12:30","12:45","13:00","13:15","13:30","13:45","14:00",
  "14:30","15:00","15:30","16:00","16:15","16:30","16:45","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00",
];

function h(i: number): string { return H[i % H.length]; }

export const MOCK_VENDAS: Venda[] = [
  // Hoje (d(0))
  { id: "v1", clienteId: "c1", horario: h(11), itens: [{ produtoNome: "Churros", quantidade: 2, valorUnitario: 8.90 }, { produtoNome: "Café Espresso", quantidade: 2, valorUnitario: 6.50 }], valorTotal: 30.80, criadoEm: d(0) },
  { id: "v2", clienteId: "c3", horario: h(14), itens: [{ produtoNome: "Brigadeiro", quantidade: 3, valorUnitario: 9.90 }], valorTotal: 29.70, criadoEm: d(0) },
  { id: "v3", clienteId: "c10", horario: h(17), itens: [{ produtoNome: "Cappuccino", quantidade: 2, valorUnitario: 9.90 }, { produtoNome: "Nutella", quantidade: 1, valorUnitario: 10.90 }], valorTotal: 30.70, criadoEm: d(0) },
  { id: "v4", clienteId: "c16", horario: h(12), itens: [{ produtoNome: "Brownie Unitário", quantidade: 2, valorUnitario: 8.50 }], valorTotal: 17.00, criadoEm: d(0) },

  // Ontem (d(1))
  { id: "v5", clienteId: "c5", horario: h(9), itens: [{ produtoNome: "Nutella", quantidade: 1, valorUnitario: 10.90 }, { produtoNome: "Muffin Chocolate", quantidade: 1, valorUnitario: 7.90 }], valorTotal: 18.80, criadoEm: d(1) },
  { id: "v6", clienteId: "c7", horario: h(13), itens: [{ produtoNome: "Maxi Bombom Creme", quantidade: 2, valorUnitario: 12.90 }], valorTotal: 25.80, criadoEm: d(1) },
  { id: "v7", clienteId: "c1", horario: h(15), itens: [{ produtoNome: "Kit Kat", quantidade: 1, valorUnitario: 11.90 }, { produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }], valorTotal: 21.80, criadoEm: d(1) },
  { id: "v8", clienteId: "c19", horario: h(16), itens: [{ produtoNome: "Latte", quantidade: 1, valorUnitario: 10.90 }], valorTotal: 10.90, criadoEm: d(1) },

  // 2 dias atrás
  { id: "v9", clienteId: "c10", horario: h(10), itens: [{ produtoNome: "Brownie Unitário", quantidade: 3, valorUnitario: 8.50 }, { produtoNome: "Café Espresso", quantidade: 3, valorUnitario: 6.50 }], valorTotal: 45.00, criadoEm: d(2) },
  { id: "v10", clienteId: "c2", horario: h(12), itens: [{ produtoNome: "Chocolate", quantidade: 4, valorUnitario: 8.90 }], valorTotal: 35.60, criadoEm: d(2) },
  { id: "v11", clienteId: "c21", horario: h(14), itens: [{ produtoNome: "Mini Chocolate", quantidade: 6, valorUnitario: 4.90 }], valorTotal: 29.40, criadoEm: d(2) },

  // 3 dias
  { id: "v12", clienteId: "c13", horario: h(11), itens: [{ produtoNome: "Red Velvet Cake", quantidade: 1, valorUnitario: 14.90 }, { produtoNome: "Croissant 60g", quantidade: 2, valorUnitario: 5.90 }], valorTotal: 26.70, criadoEm: d(3) },
  { id: "v13", clienteId: "c5", horario: h(13), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Brigadeiro Pistache", quantidade: 1, valorUnitario: 11.90 }], valorTotal: 21.80, criadoEm: d(3) },
  { id: "v14", clienteId: "c3", horario: h(16), itens: [{ produtoNome: "Petit Gateau Chocolate", quantidade: 1, valorUnitario: 16.90 }], valorTotal: 16.90, criadoEm: d(3) },

  // 4 dias
  { id: "v15", clienteId: "c16", horario: h(12), itens: [{ produtoNome: "Petit Gateau Chocolate", quantidade: 2, valorUnitario: 16.90 }], valorTotal: 33.80, criadoEm: d(4) },
  { id: "v16", clienteId: "c1", horario: h(14), itens: [{ produtoNome: "Creme com Cobertura", quantidade: 2, valorUnitario: 9.50 }], valorTotal: 19.00, criadoEm: d(4) },

  // 5 dias
  { id: "v17", clienteId: "c5", horario: h(10), itens: [{ produtoNome: "Creme com Cobertura", quantidade: 2, valorUnitario: 9.50 }, { produtoNome: "Pudim de Leite Moça", quantidade: 1, valorUnitario: 9.90 }], valorTotal: 28.90, criadoEm: d(5) },
  { id: "v18", clienteId: "c19", horario: h(13), itens: [{ produtoNome: "Cookies and Cream", quantidade: 2, valorUnitario: 10.90 }], valorTotal: 21.80, criadoEm: d(5) },
  { id: "v19", clienteId: "c7", horario: h(17), itens: [{ produtoNome: "Cappuccino", quantidade: 2, valorUnitario: 9.90 }, { produtoNome: "Churros", quantidade: 1, valorUnitario: 8.90 }], valorTotal: 28.70, criadoEm: d(5) },

  // 6 dias
  { id: "v20", clienteId: "c21", horario: h(11), itens: [{ produtoNome: "Mini Chocolate", quantidade: 4, valorUnitario: 4.90 }], valorTotal: 19.60, criadoEm: d(6) },
  { id: "v21", clienteId: "c10", horario: h(13), itens: [{ produtoNome: "Latte", quantidade: 1, valorUnitario: 10.90 }, { produtoNome: "Nutella", quantidade: 1, valorUnitario: 10.90 }], valorTotal: 21.80, criadoEm: d(6) },

  // 7-14 dias atrás
  { id: "v22", clienteId: "c3", horario: h(12), itens: [{ produtoNome: "Frutas Vermelhas", quantidade: 2, valorUnitario: 9.90 }], valorTotal: 19.80, criadoEm: d(8) },
  { id: "v23", clienteId: "c8", horario: h(14), itens: [{ produtoNome: "Doce de Leite", quantidade: 3, valorUnitario: 8.90 }, { produtoNome: "Muffin Baunilha", quantidade: 1, valorUnitario: 7.90 }], valorTotal: 34.60, criadoEm: d(9) },
  { id: "v24", clienteId: "c1", horario: h(10), itens: [{ produtoNome: "Homer Creme", quantidade: 2, valorUnitario: 10.90 }], valorTotal: 21.80, criadoEm: d(10) },
  { id: "v25", clienteId: "c11", horario: h(13), itens: [{ produtoNome: "Leite Moça", quantidade: 2, valorUnitario: 8.90 }], valorTotal: 17.80, criadoEm: d(11) },
  { id: "v26", clienteId: "c14", horario: h(15), itens: [{ produtoNome: "Brownie Unitário", quantidade: 2, valorUnitario: 8.50 }, { produtoNome: "Café Espresso", quantidade: 2, valorUnitario: 6.50 }], valorTotal: 30.00, criadoEm: d(12) },
  { id: "v27", clienteId: "c7", horario: h(12), itens: [{ produtoNome: "Maxi Bombom Frutas Vermelhas", quantidade: 1, valorUnitario: 13.90 }], valorTotal: 13.90, criadoEm: d(13) },
  { id: "v28", clienteId: "c5", horario: h(16), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Churros", quantidade: 2, valorUnitario: 8.90 }], valorTotal: 27.70, criadoEm: d(13) },
  { id: "v29", clienteId: "c16", horario: h(11), itens: [{ produtoNome: "Brigadeiro", quantidade: 2, valorUnitario: 9.90 }], valorTotal: 19.80, criadoEm: d(14) },

  // 14-30 dias atrás
  { id: "v30", clienteId: "c2", horario: h(12), itens: [{ produtoNome: "Brigadeiro Pistache", quantidade: 2, valorUnitario: 11.90 }], valorTotal: 23.80, criadoEm: d(16) },
  { id: "v31", clienteId: "c24", horario: h(14), itens: [{ produtoNome: "Coração Fini Beijos", quantidade: 3, valorUnitario: 9.90 }], valorTotal: 29.70, criadoEm: d(18) },
  { id: "v32", clienteId: "c6", horario: h(10), itens: [{ produtoNome: "Bolo Chocolate", quantidade: 1, valorUnitario: 18.90 }], valorTotal: 18.90, criadoEm: d(20) },
  { id: "v33", clienteId: "c9", horario: h(13), itens: [{ produtoNome: "Churros", quantidade: 2, valorUnitario: 8.90 }, { produtoNome: "Paçoquita", quantidade: 1, valorUnitario: 9.90 }], valorTotal: 27.70, criadoEm: d(22) },
  { id: "v34", clienteId: "c1", horario: h(15), itens: [{ produtoNome: "Mini Bombom Creme", quantidade: 4, valorUnitario: 5.90 }], valorTotal: 23.60, criadoEm: d(25) },
  { id: "v35", clienteId: "c17", horario: h(12), itens: [{ produtoNome: "Creme", quantidade: 2, valorUnitario: 8.90 }], valorTotal: 17.80, criadoEm: d(28) },
  { id: "v36", clienteId: "c3", horario: h(14), itens: [{ produtoNome: "Cappuccino", quantidade: 2, valorUnitario: 9.90 }, { produtoNome: "Nutella", quantidade: 2, valorUnitario: 10.90 }], valorTotal: 41.60, criadoEm: d(18) },
  { id: "v37", clienteId: "c10", horario: h(16), itens: [{ produtoNome: "Latte", quantidade: 2, valorUnitario: 10.90 }], valorTotal: 21.80, criadoEm: d(20) },
  { id: "v38", clienteId: "c13", horario: h(11), itens: [{ produtoNome: "Muffin Red Velvet", quantidade: 2, valorUnitario: 8.90 }], valorTotal: 17.80, criadoEm: d(21) },
  { id: "v39", clienteId: "c7", horario: h(13), itens: [{ produtoNome: "Café Espresso", quantidade: 1, valorUnitario: 6.50 }, { produtoNome: "Croissant 60g", quantidade: 1, valorUnitario: 5.90 }], valorTotal: 12.40, criadoEm: d(23) },
  { id: "v40", clienteId: "c21", horario: h(12), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Brownie Unitário", quantidade: 1, valorUnitario: 8.50 }], valorTotal: 18.40, criadoEm: d(24) },
  { id: "v41", clienteId: "c5", horario: h(15), itens: [{ produtoNome: "Brigadeiro", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Café Espresso", quantidade: 1, valorUnitario: 6.50 }], valorTotal: 16.40, criadoEm: d(26) },
  { id: "v42", clienteId: "c19", horario: h(14), itens: [{ produtoNome: "Chocolate Quente", quantidade: 1, valorUnitario: 8.90 }, { produtoNome: "Croissant 20g", quantidade: 3, valorUnitario: 3.50 }], valorTotal: 19.40, criadoEm: d(27) },
  { id: "v43", clienteId: "c2", horario: h(10), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Nutella", quantidade: 1, valorUnitario: 10.90 }], valorTotal: 20.80, criadoEm: d(29) },

  // 30-60 dias atrás
  { id: "v44", clienteId: "c4", horario: h(12), itens: [{ produtoNome: "Original Glacê", quantidade: 2, valorUnitario: 8.90 }], valorTotal: 17.80, criadoEm: d(35) },
  { id: "v45", clienteId: "c12", horario: h(14), itens: [{ produtoNome: "Chocolate", quantidade: 1, valorUnitario: 8.90 }], valorTotal: 8.90, criadoEm: d(40) },
  { id: "v46", clienteId: "c15", horario: h(9), itens: [{ produtoNome: "Pão Torrado Petrópolis", quantidade: 3, valorUnitario: 4.50 }], valorTotal: 13.50, criadoEm: d(45) },
  { id: "v47", clienteId: "c18", horario: h(13), itens: [{ produtoNome: "Pudim Fini Bananas", quantidade: 2, valorUnitario: 9.90 }], valorTotal: 19.80, criadoEm: d(50) },
  { id: "v48", clienteId: "c8", horario: h(11), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Brigadeiro Pistache", quantidade: 1, valorUnitario: 11.90 }], valorTotal: 21.80, criadoEm: d(32) },
  { id: "v49", clienteId: "c11", horario: h(15), itens: [{ produtoNome: "Latte", quantidade: 1, valorUnitario: 10.90 }, { produtoNome: "Muffin Chocolate", quantidade: 1, valorUnitario: 7.90 }], valorTotal: 18.80, criadoEm: d(34) },
  { id: "v50", clienteId: "c14", horario: h(13), itens: [{ produtoNome: "Brownie Unitário", quantidade: 1, valorUnitario: 8.50 }], valorTotal: 8.50, criadoEm: d(36) },
  { id: "v51", clienteId: "c6", horario: h(12), itens: [{ produtoNome: "Café Espresso", quantidade: 2, valorUnitario: 6.50 }, { produtoNome: "Croissant 60g", quantidade: 2, valorUnitario: 5.90 }], valorTotal: 24.80, criadoEm: d(38) },
  { id: "v52", clienteId: "c9", horario: h(10), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }], valorTotal: 9.90, criadoEm: d(42) },
  { id: "v53", clienteId: "c24", horario: h(14), itens: [{ produtoNome: "Nutella", quantidade: 2, valorUnitario: 10.90 }, { produtoNome: "Café Espresso", quantidade: 1, valorUnitario: 6.50 }], valorTotal: 28.30, criadoEm: d(33) },
  { id: "v54", clienteId: "c17", horario: h(16), itens: [{ produtoNome: "Chocolate Quente", quantidade: 1, valorUnitario: 8.90 }], valorTotal: 8.90, criadoEm: d(37) },

  // 60-90 dias atrás
  { id: "v55", clienteId: "c20", horario: h(12), itens: [{ produtoNome: "Croissant 20g", quantidade: 5, valorUnitario: 3.50 }], valorTotal: 17.50, criadoEm: d(55) },
  { id: "v56", clienteId: "c22", horario: h(14), itens: [{ produtoNome: "Bolo Integral Castanha", quantidade: 1, valorUnitario: 16.90 }], valorTotal: 16.90, criadoEm: d(62) },
  { id: "v57", clienteId: "c23", horario: h(11), itens: [{ produtoNome: "Muffin Red Velvet", quantidade: 2, valorUnitario: 8.90 }], valorTotal: 17.80, criadoEm: d(65) },
  { id: "v58", clienteId: "c25", horario: h(13), itens: [{ produtoNome: "Nutella", quantidade: 1, valorUnitario: 10.90 }], valorTotal: 10.90, criadoEm: d(70) },
  { id: "v59", clienteId: "c4", horario: h(10), itens: [{ produtoNome: "Café Espresso", quantidade: 1, valorUnitario: 6.50 }, { produtoNome: "Croissant 20g", quantidade: 2, valorUnitario: 3.50 }], valorTotal: 13.50, criadoEm: d(60) },
  { id: "v60", clienteId: "c12", horario: h(15), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }], valorTotal: 9.90, criadoEm: d(63) },
  { id: "v61", clienteId: "c15", horario: h(12), itens: [{ produtoNome: "Brownie Unitário", quantidade: 2, valorUnitario: 8.50 }], valorTotal: 17.00, criadoEm: d(67) },
  { id: "v62", clienteId: "c18", horario: h(14), itens: [{ produtoNome: "Creme", quantidade: 1, valorUnitario: 8.90 }, { produtoNome: "Café Espresso", quantidade: 1, valorUnitario: 6.50 }], valorTotal: 15.40, criadoEm: d(72) },
  { id: "v63", clienteId: "c20", horario: h(11), itens: [{ produtoNome: "Latte", quantidade: 1, valorUnitario: 10.90 }], valorTotal: 10.90, criadoEm: d(75) },
  { id: "v64", clienteId: "c22", horario: h(13), itens: [{ produtoNome: "Brigadeiro", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Café Espresso", quantidade: 1, valorUnitario: 6.50 }], valorTotal: 16.40, criadoEm: d(78) },
  { id: "v65", clienteId: "c25", horario: h(16), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Croissant 60g", quantidade: 1, valorUnitario: 5.90 }], valorTotal: 15.80, criadoEm: d(80) },
  { id: "v66", clienteId: "c23", horario: h(10), itens: [{ produtoNome: "Churros", quantidade: 1, valorUnitario: 8.90 }], valorTotal: 8.90, criadoEm: d(82) },

  // Extra — mais vendas recentes para dados mais ricos
  { id: "v67", clienteId: "c3", horario: h(9), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Churros", quantidade: 1, valorUnitario: 8.90 }], valorTotal: 18.80, criadoEm: d(0) },
  { id: "v68", clienteId: "c7", horario: h(11), itens: [{ produtoNome: "Latte", quantidade: 1, valorUnitario: 10.90 }, { produtoNome: "Brownie Unitário", quantidade: 1, valorUnitario: 8.50 }], valorTotal: 19.40, criadoEm: d(0) },
  { id: "v69", clienteId: "c2", horario: h(14), itens: [{ produtoNome: "Café Espresso", quantidade: 1, valorUnitario: 6.50 }], valorTotal: 6.50, criadoEm: d(1) },
  { id: "v70", clienteId: "c13", horario: h(16), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Nutella", quantidade: 1, valorUnitario: 10.90 }], valorTotal: 20.80, criadoEm: d(1) },
  { id: "v71", clienteId: "c8", horario: h(12), itens: [{ produtoNome: "Brigadeiro", quantidade: 2, valorUnitario: 9.90 }, { produtoNome: "Café Espresso", quantidade: 1, valorUnitario: 6.50 }], valorTotal: 26.30, criadoEm: d(2) },
  { id: "v72", clienteId: "c24", horario: h(13), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Croissant 60g", quantidade: 2, valorUnitario: 5.90 }], valorTotal: 21.70, criadoEm: d(3) },
  { id: "v73", clienteId: "c11", horario: h(15), itens: [{ produtoNome: "Chocolate Quente", quantidade: 1, valorUnitario: 8.90 }, { produtoNome: "Muffin Baunilha", quantidade: 1, valorUnitario: 7.90 }], valorTotal: 16.80, criadoEm: d(4) },
  { id: "v74", clienteId: "c14", horario: h(10), itens: [{ produtoNome: "Cappuccino", quantidade: 1, valorUnitario: 9.90 }, { produtoNome: "Brigadeiro Pistache", quantidade: 1, valorUnitario: 11.90 }], valorTotal: 21.80, criadoEm: d(5) },
  { id: "v75", clienteId: "c1", horario: h(12), itens: [{ produtoNome: "Suco Natural", quantidade: 1, valorUnitario: 7.90 }, { produtoNome: "Croissant 20g", quantidade: 2, valorUnitario: 3.50 }], valorTotal: 14.90, criadoEm: d(6) },
];

// ─── Helpers ────────────────────────────────────────────────────

export function getClienteById(id: string): Cliente | undefined {
  return MOCK_CLIENTES.find((c) => c.id === id);
}

export function getVendasByCliente(clienteId: string): Venda[] {
  return MOCK_VENDAS.filter((v) => v.clienteId === clienteId).sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  );
}

export function getVendasByPeriodo(dias: number): Venda[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - dias);
  return MOCK_VENDAS.filter((v) => new Date(v.criadoEm) >= cutoff);
}

export function getTotalGasto(clienteId: string): number {
  return getVendasByCliente(clienteId).reduce((s, v) => s + v.valorTotal, 0);
}

export function getTicketMedio(clienteId: string): number {
  const vendas = getVendasByCliente(clienteId);
  if (vendas.length === 0) return 0;
  return getTotalGasto(clienteId) / vendas.length;
}

export function getUltimaCompra(clienteId: string): string | null {
  const vendas = getVendasByCliente(clienteId);
  return vendas.length > 0 ? vendas[0].criadoEm : null;
}

export function getProdutosFavoritos(clienteId: string): { nome: string; qtd: number }[] {
  const vendas = getVendasByCliente(clienteId);
  const counts: Record<string, number> = {};
  vendas.forEach((v) =>
    v.itens.forEach((i) => {
      counts[i.produtoNome] = (counts[i.produtoNome] || 0) + i.quantidade;
    }),
  );
  return Object.entries(counts)
    .map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR");
}

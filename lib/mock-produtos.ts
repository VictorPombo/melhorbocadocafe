/**
 * Catálogo de produtos da Melhor Bocado com preços.
 * Fonte única para o PDV — atendente toca, sistema calcula.
 */

export interface Produto {
  id: string;
  categoria: string;
  categoriaIcone: string;
  nome: string;
  preco: number;
  ativo: boolean;
  ordem: number;
}

export const CATEGORIAS_PDV = [
  { slug: "donuts", nome: "Donuts", icone: "" },
  { slug: "rings", nome: "Rings", icone: "" },
  { slug: "bombom", nome: "Bombom", icone: "" },
  { slug: "mini", nome: "Mini Donuts", icone: "🟡" },
  { slug: "cakes", nome: "Bolos", icone: "" },
  { slug: "muffins", nome: "Muffins", icone: "" },
  { slug: "paes", nome: "Pães", icone: "" },
  { slug: "sobremesas", nome: "Sobremesas", icone: "" },
  { slug: "bebidas", nome: "Bebidas", icone: "" },
] as const;

export type CategoriaPDV = (typeof CATEGORIAS_PDV)[number]["slug"];

export const MOCK_PRODUTOS: Produto[] = [
  // Donuts
  { id: "p1", categoria: "donuts", categoriaIcone: "", nome: "Churros", preco: 8.90, ativo: true, ordem: 1 },
  { id: "p2", categoria: "donuts", categoriaIcone: "", nome: "Creme", preco: 8.90, ativo: true, ordem: 2 },
  { id: "p3", categoria: "donuts", categoriaIcone: "", nome: "Creme com Cobertura", preco: 9.50, ativo: true, ordem: 3 },
  { id: "p4", categoria: "donuts", categoriaIcone: "", nome: "Chocolate", preco: 8.90, ativo: true, ordem: 4 },
  { id: "p5", categoria: "donuts", categoriaIcone: "", nome: "Doce de Leite", preco: 8.90, ativo: true, ordem: 5 },
  { id: "p6", categoria: "donuts", categoriaIcone: "", nome: "Frutas Vermelhas", preco: 9.90, ativo: true, ordem: 6 },
  { id: "p7", categoria: "donuts", categoriaIcone: "", nome: "Kit Kat", preco: 11.90, ativo: true, ordem: 7 },
  { id: "p8", categoria: "donuts", categoriaIcone: "", nome: "Leite Moça", preco: 8.90, ativo: true, ordem: 8 },
  { id: "p9", categoria: "donuts", categoriaIcone: "", nome: "Nutella", preco: 10.90, ativo: true, ordem: 9 },
  { id: "p10", categoria: "donuts", categoriaIcone: "", nome: "Coração Fini Beijos", preco: 9.90, ativo: true, ordem: 10 },

  // Rings
  { id: "p11", categoria: "rings", categoriaIcone: "", nome: "Brigadeiro", preco: 9.90, ativo: true, ordem: 1 },
  { id: "p12", categoria: "rings", categoriaIcone: "", nome: "Brigadeiro Pistache", preco: 11.90, ativo: true, ordem: 2 },
  { id: "p13", categoria: "rings", categoriaIcone: "", nome: "Cookies and Cream", preco: 10.90, ativo: true, ordem: 3 },
  { id: "p14", categoria: "rings", categoriaIcone: "", nome: "Homer Creme", preco: 10.90, ativo: true, ordem: 4 },
  { id: "p15", categoria: "rings", categoriaIcone: "", nome: "Paçoquita", preco: 9.90, ativo: true, ordem: 5 },
  { id: "p16", categoria: "rings", categoriaIcone: "", nome: "Original Glacê", preco: 8.90, ativo: true, ordem: 6 },
  { id: "p17", categoria: "rings", categoriaIcone: "", nome: "Creme de Morango", preco: 9.90, ativo: true, ordem: 7 },
  { id: "p18", categoria: "rings", categoriaIcone: "", nome: "Doce de Leite Crocante", preco: 10.90, ativo: true, ordem: 8 },

  // Bombom
  { id: "p19", categoria: "bombom", categoriaIcone: "", nome: "Maxi Bombom Creme", preco: 12.90, ativo: true, ordem: 1 },
  { id: "p20", categoria: "bombom", categoriaIcone: "", nome: "Maxi Bombom Doce de Leite", preco: 12.90, ativo: true, ordem: 2 },
  { id: "p21", categoria: "bombom", categoriaIcone: "", nome: "Maxi Bombom Frutas Vermelhas", preco: 13.90, ativo: true, ordem: 3 },
  { id: "p22", categoria: "bombom", categoriaIcone: "", nome: "Mini Bombom Creme", preco: 5.90, ativo: true, ordem: 4 },
  { id: "p23", categoria: "bombom", categoriaIcone: "", nome: "Mini Bombom Doce de Leite", preco: 5.90, ativo: true, ordem: 5 },
  { id: "p24", categoria: "bombom", categoriaIcone: "", nome: "Mini Bombom Frutas Vermelhas", preco: 5.90, ativo: true, ordem: 6 },

  // Mini Donuts
  { id: "p25", categoria: "mini", categoriaIcone: "🟡", nome: "Mini Chocolate", preco: 4.90, ativo: true, ordem: 1 },
  { id: "p26", categoria: "mini", categoriaIcone: "🟡", nome: "Mini Doce de Leite", preco: 4.90, ativo: true, ordem: 2 },
  { id: "p27", categoria: "mini", categoriaIcone: "🟡", nome: "Mini Frutas Vermelhas", preco: 4.90, ativo: true, ordem: 3 },
  { id: "p28", categoria: "mini", categoriaIcone: "🟡", nome: "Mini Nutella", preco: 5.90, ativo: true, ordem: 4 },
  { id: "p29", categoria: "mini", categoriaIcone: "🟡", nome: "Mini Creme", preco: 4.90, ativo: true, ordem: 5 },
  { id: "p30", categoria: "mini", categoriaIcone: "🟡", nome: "Mini Leite Moça", preco: 4.90, ativo: true, ordem: 6 },

  // Bolos
  { id: "p31", categoria: "cakes", categoriaIcone: "", nome: "Bolo Banana e Aveia", preco: 14.90, ativo: true, ordem: 1 },
  { id: "p32", categoria: "cakes", categoriaIcone: "", nome: "Bolo Chocolate", preco: 18.90, ativo: true, ordem: 2 },
  { id: "p33", categoria: "cakes", categoriaIcone: "", nome: "Bolo Coco", preco: 14.90, ativo: true, ordem: 3 },
  { id: "p34", categoria: "cakes", categoriaIcone: "", nome: "Bolo Integral Castanha", preco: 16.90, ativo: true, ordem: 4 },
  { id: "p35", categoria: "cakes", categoriaIcone: "", nome: "Red Velvet Cake", preco: 14.90, ativo: true, ordem: 5 },

  // Muffins
  { id: "p36", categoria: "muffins", categoriaIcone: "", nome: "Muffin Baunilha", preco: 7.90, ativo: true, ordem: 1 },
  { id: "p37", categoria: "muffins", categoriaIcone: "", nome: "Muffin Chocolate", preco: 7.90, ativo: true, ordem: 2 },
  { id: "p38", categoria: "muffins", categoriaIcone: "", nome: "Muffin Red Velvet", preco: 8.90, ativo: true, ordem: 3 },

  // Pães
  { id: "p39", categoria: "paes", categoriaIcone: "", nome: "Croissant 20g", preco: 3.50, ativo: true, ordem: 1 },
  { id: "p40", categoria: "paes", categoriaIcone: "", nome: "Croissant 60g", preco: 5.90, ativo: true, ordem: 2 },
  { id: "p41", categoria: "paes", categoriaIcone: "", nome: "Pão Torrado Petrópolis", preco: 4.50, ativo: true, ordem: 3 },

  // Sobremesas
  { id: "p42", categoria: "sobremesas", categoriaIcone: "", nome: "Brownie Unitário", preco: 8.50, ativo: true, ordem: 1 },
  { id: "p43", categoria: "sobremesas", categoriaIcone: "", nome: "Petit Gateau Chocolate", preco: 16.90, ativo: true, ordem: 2 },
  { id: "p44", categoria: "sobremesas", categoriaIcone: "", nome: "Pudim de Leite Moça", preco: 9.90, ativo: true, ordem: 3 },
  { id: "p45", categoria: "sobremesas", categoriaIcone: "", nome: "Pudim Fini Bananas", preco: 9.90, ativo: true, ordem: 4 },

  // Bebidas
  { id: "p46", categoria: "bebidas", categoriaIcone: "", nome: "Café Espresso", preco: 6.50, ativo: true, ordem: 1 },
  { id: "p47", categoria: "bebidas", categoriaIcone: "", nome: "Cappuccino", preco: 9.90, ativo: true, ordem: 2 },
  { id: "p48", categoria: "bebidas", categoriaIcone: "", nome: "Latte", preco: 10.90, ativo: true, ordem: 3 },
  { id: "p49", categoria: "bebidas", categoriaIcone: "", nome: "Chocolate Quente", preco: 8.90, ativo: true, ordem: 4 },
  { id: "p50", categoria: "bebidas", categoriaIcone: "", nome: "Suco Natural", preco: 7.90, ativo: true, ordem: 5 },
];

/** Busca produto por ID */
export function getProdutoById(id: string): Produto | undefined {
  return MOCK_PRODUTOS.find((p) => p.id === id);
}

/** Filtra produtos ativos por categoria */
export function getProdutosByCategoria(cat: string): Produto[] {
  return MOCK_PRODUTOS.filter((p) => p.categoria === cat && p.ativo).sort((a, b) => a.ordem - b.ordem);
}

/** Busca produto por nome (match parcial) */
export function searchProdutos(query: string): Produto[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  return MOCK_PRODUTOS.filter((p) => p.ativo && p.nome.toLowerCase().includes(q)).slice(0, 8);
}

export interface Produto {
  nome: string;
  destaque?: boolean;
}

export interface Categoria {
  nome: string;
  slug: string;
  descricao: string;
  produtos: Produto[];
}

export const CARDAPIO: Categoria[] = [
  {
    nome: "Donuts",
    slug: "donuts",
    descricao: "Donuts fofinhos, recheados e deliciosos para todos os gostos.",
    produtos: [
      { nome: "Churros" },
      { nome: "Creme" },
      { nome: "Creme com Cobertura" },
      { nome: "Chocolate" },
      { nome: "Doce de Leite" },
      { nome: "Frutas Vermelhas" },
      { nome: "Kit Kat" },
      { nome: "Leite Moça" },
      { nome: "Nutella" },
      { nome: "Coração Fini Beijos" },
    ],
  },
  {
    nome: "Rings",
    slug: "rings",
    descricao: "Anéis crocantes com coberturas e recheios irresistíveis.",
    produtos: [
      { nome: "Blueberry" },
      { nome: "Brigadeiro" },
      { nome: "Leitinho" },
      { nome: "Brigadeiro Pistache" },
      { nome: "Chocolate Preto e Branco" },
      { nome: "Cookies and Cream" },
      { nome: "Creme de Morango" },
      { nome: "Creme Crocante" },
      { nome: "Doce de Leite Crocante" },
      { nome: "Frutas Vermelhas" },
      { nome: "Donuts Recheio Chocolate" },
      { nome: "Homer Creme" },
      { nome: "Mini Ring Homer" },
      { nome: "Mini Ring Brigadeiro" },
      { nome: "Donuts Ring Original Glacê" },
      { nome: "Paçoquita" },
    ],
  },
  {
    nome: "Donuts Bombom",
    slug: "donuts-bombom",
    descricao: "Lançamento! Donuts inspirados nos bombons que todo mundo ama.",
    produtos: [
      { nome: "Maxi Donuts Bombom Creme", destaque: true },
      { nome: "Maxi Donuts Bombom Doce de Leite", destaque: true },
      { nome: "Maxi Donuts Bombom Frutas Vermelhas", destaque: true },
      { nome: "Mini Bombom Creme", destaque: true },
      { nome: "Mini Bombom Doce de Leite", destaque: true },
      { nome: "Mini Bombom Frutas Vermelhas", destaque: true },
    ],
  },
  {
    nome: "Mini Donuts",
    slug: "mini-donuts",
    descricao: "Versões mini para quem quer provar um pouquinho de cada.",
    produtos: [
      { nome: "Chocolate" },
      { nome: "Doce de Leite" },
      { nome: "Frutas Vermelhas" },
      { nome: "Nutella" },
      { nome: "Creme" },
      { nome: "Leite Moça" },
    ],
  },
  {
    nome: "Cakes / Bolos",
    slug: "cakes",
    descricao: "Bolos artesanais feitos com carinho todos os dias.",
    produtos: [
      { nome: "Banana e Aveia" },
      { nome: "Chocolate" },
      { nome: "Coco" },
      { nome: "Integral Castanha e Tâmara" },
      { nome: "Red Velvet" },
    ],
  },
  {
    nome: "Muffins",
    slug: "muffins",
    descricao: "Muffins macios e saborosos, perfeitos para acompanhar o café.",
    produtos: [
      { nome: "Baunilha" },
      { nome: "Chocolate" },
      { nome: "Red Velvet" },
    ],
  },
  {
    nome: "Pães",
    slug: "paes",
    descricao: "Croissants e pães selecionados para o seu café da manhã.",
    produtos: [
      { nome: "Croissant 20g" },
      { nome: "Croissant 60g" },
      { nome: "Pão Torrado Petrópolis" },
    ],
  },
  {
    nome: "Sobremesas",
    slug: "sobremesas",
    descricao: "Sobremesas especiais para fechar com chave de ouro.",
    produtos: [
      { nome: "Brownie Unitário" },
      { nome: "Petit Gateau Chocolate" },
      { nome: "Pudim de Leite Moça" },
      { nome: "Pudim Fini Bananas" },
      { nome: "Pudim Fini Dentaduras" },
    ],
  },
  {
    nome: "Supermercado / Caixas",
    slug: "caixas",
    descricao: "Leve pra casa! Caixas com donuts para curtir quando quiser.",
    produtos: [
      { nome: "Donut Recheado Chocolate" },
      { nome: "Donuts Creme" },
      { nome: "Donuts Doce de Leite" },
      { nome: "Mini Donut Chocolate" },
      { nome: "Mini Donut Creme" },
      { nome: "Mini Donut Doce de Leite" },
      { nome: "Mini Donut Leite Moça" },
    ],
  },
];

/** Total de produtos sem duplicação */
export const TOTAL_PRODUTOS = CARDAPIO.reduce(
  (acc, cat) => acc + cat.produtos.length,
  0,
);

export interface Post {
  titulo: string;
  slug: string;
  data: string; // ISO date string
  imagem: string;
  imagemAlt: string;
  resumo: string;
  conteudo: string; // HTML content
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * POSTS DO BLOG
 * ═══════════════════════════════════════════════════════════════════
 * Adicione novos posts ao array abaixo. O mais recente deve ficar
 * no topo. Cada post precisa de:
 * - titulo, slug (URL amigável), data (ISO), imagem, resumo, conteudo
 * ═══════════════════════════════════════════════════════════════════
 */

export const POSTS: Post[] = [
  {
    titulo:
      "Chegou a Melhor Bocado Café no Tatuapé: donuts americanos artesanais",
    slug: "chegou-melhor-bocado-cafe-tatuape",
    data: "2025-06-20",
    imagem: "/blog-inauguracao.jpg",
    imagemAlt:
      "Donuts americanos artesanais da Melhor Bocado Café no Tatuapé, São Paulo",
    resumo:
      "A Melhor Bocado Café abriu as portas no Tatuapé com donuts americanos artesanais, café especial e um espaço instagramável. Conheça nossa nova loja!",
    conteudo: `
      <p>A espera acabou! A <strong>Melhor Bocado Café</strong> chegou ao <strong>Tatuapé</strong> trazendo os legítimos <strong>donuts americanos artesanais</strong> para a Zona Leste de São Paulo. Nossa loja fica na Rua Serra de Japi, 1280, em um espaço aconchegante, moderno e perfeito para aquela pausa gostosa no dia.</p>

      <p>Cada donut é preparado diariamente com <strong>massa artesanal leve e fresquinha</strong>, fermentada no ponto certo para garantir a textura macia que faz toda a diferença. As coberturas e recheios são premium: do glazed clássico ao chocolate belga, passando por pistache, frutas vermelhas e doce de leite.</p>

      <p>Além dos donuts, temos <strong>café especial</strong> preparado com grãos selecionados, bebidas geladas, e opções para todos os gostos. O ambiente foi pensado para ser <strong>instagramável</strong> — cada cantinho rende uma foto bonita.</p>

      <p>Estamos de segunda a sábado das 8h às 20h, e aos domingos das 9h às 18h. Venha conhecer a <strong>Melhor Bocado Café Tatuapé</strong> e descubra por que somos a melhor parte do seu dia! Também entregamos pelo <strong>iFood</strong> para você curtir em casa.</p>
    `,
  },
  {
    titulo: "Os sabores de donut mais pedidos da nossa loja no Tatuapé",
    slug: "sabores-donut-mais-pedidos-tatuape",
    data: "2025-06-15",
    imagem: "/donut-chocolate.jpg",
    imagemAlt:
      "Donut de chocolate belga com sprinkles da Melhor Bocado Café Tatuapé",
    resumo:
      "Descubra quais são os sabores de donut mais pedidos na Melhor Bocado Café Tatuapé: do glazed clássico ao chocolate belga com sprinkles.",
    conteudo: `
      <p>Desde que abrimos no <strong>Tatuapé</strong>, já deu para perceber quais <strong>sabores de donut</strong> conquistaram o coração (e o paladar) dos nossos clientes. Se você ainda não experimentou, aqui vai um spoiler dos campeões de venda!</p>

      <h2>Glazed Clássico</h2>
      <p>O queridinho de todos. Nosso <strong>donut glazed</strong> leva uma cobertura fina e crocante de açúcar que derrete na boca. É simples, mas feito com massa artesanal que faz toda a diferença. Perfeito para acompanhar um <strong>café coado</strong> fresquinho.</p>

      <h2>Chocolate Belga com Sprinkles</h2>
      <p>Para os chocólatras de plantão, esse donut leva cobertura generosa de <strong>chocolate belga</strong> derretido e sprinkles coloridos por cima. É bonito, gostoso e rende foto no Instagram. Sem dúvida, um dos mais pedidos da nossa loja no <strong>Tatuapé</strong>.</p>

      <h2>Frutas Vermelhas</h2>
      <p>A opção perfeita para quem busca um sabor mais refrescante. A cobertura de <strong>frutas vermelhas</strong> com morango, framboesa e mirtilo traz acidez na medida certa, equilibrando com a doçura da massa. Ideal para a tarde em <strong>São Paulo</strong>.</p>

      <p>Esses são só os destaques — temos mais sabores esperando por você. Passe na <strong>Melhor Bocado Café</strong>, Rua Serra de Japi, 1280, ou peça pelo <strong>iFood</strong>!</p>
    `,
  },
  {
    titulo: "Onde tomar um bom café no Tatuapé? Conheça nosso espaço",
    slug: "onde-tomar-cafe-tatuape",
    data: "2025-06-10",
    imagem: "/cafe-ambiente.jpg",
    imagemAlt:
      "Interior aconchegante da Melhor Bocado Café no bairro do Tatuapé, São Paulo",
    resumo:
      "Procurando onde tomar um bom café no Tatuapé? A Melhor Bocado Café tem o espaço perfeito: aconchegante, instagramável e com donuts artesanais.",
    conteudo: `
      <p>Se você mora ou trabalha no <strong>Tatuapé</strong> e está procurando um lugar especial para tomar <strong>café</strong>, a Melhor Bocado Café é o seu novo point. Nosso espaço foi projetado para ser acolhedor, moderno e — claro — perfeito para fotos.</p>

      <p>Trabalhamos com <strong>grãos selecionados</strong> de torrefações artesanais de <strong>São Paulo</strong>. Cada xícara é preparada com cuidado, seja o clássico espresso, o coado na Hario V60 ou as nossas bebidas geladas que fazem sucesso nos dias quentes.</p>

      <p>E o melhor: aqui o café vem acompanhado de <strong>donuts americanos artesanais</strong> fresquinhos. A combinação de um bom café com um donut glazed é simples e perfeita. Nosso ambiente tem mesas confortáveis, iluminação aconchegante e decoração que combina com o clima alegre da marca.</p>

      <p>Estamos na Rua Serra de Japi, 1280, <strong>Tatuapé</strong>, com funcionamento de segunda a sábado das 8h às 20h e domingos das 9h às 18h. Venha tomar o melhor <strong>café do Tatuapé</strong> com a gente!</p>
    `,
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * CONFIGURAÇÃO DA LOJA
 * ═══════════════════════════════════════════════════════════════════
 * Para criar o site de uma nova unidade, basta duplicar este projeto
 * e alterar os valores abaixo. O restante do layout se adapta
 * automaticamente.
 * ═══════════════════════════════════════════════════════════════════
 */

export const LOJA = {
  nome: "Melhor Bocado Café Tatuapé",
  nomeCurto: "Melhor Bocado Café",
  bairro: "Tatuapé",
  subtitulo:
    "Os legítimos Donuts Americanos chegaram ao Tatuapé. Todo dia merece um momento Gostoso!",
  descricao:
    "Massa artesanal, leve e fresquinha, preparada todos os dias. Coberturas e recheios premium: glazed clássico, chocolate belga, pistache, frutas vermelhas e doce de leite.",
  endereco: "Rua Serra de Japi, 1280 – Tatuapé, São Paulo/SP",
  telefone: "5511935369625",
  horario: {
    semana: "Segunda a Sábado: 8h às 20h",
    domingo: "Domingo: 9h às 18h",
    abreSegSab: 8,
    fechaSegSab: 20,
    abreDom: 9,
    fechaDom: 18,
  },
  links: {
    google:
      "https://share.google/4GFFuatZs7QtXgWpQ",
    whatsapp:
      "https://wa.me/5511935369625?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20da%20Melhor%20Bocado%20Caf%C3%A9%20Tatuap%C3%A9",
    ifood:
      "https://www.ifood.com.br/delivery/sao-paulo-sp/donuts-do-melhor-bocado-cafe-tatuape-vila-gomes-cardim/0e2f0424-0e42-41a5-9969-27104ab4f79c",
    instagram: "https://www.instagram.com/melhorbocadocafe.tatuape",
    tiktok: "https://www.tiktok.com/@melhorbocadocafe.tatuape",
    uber: "https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=-23.5444&dropoff[longitude]=-46.5756&dropoff[nickname]=Melhor%20Bocado%20Caf%C3%A9%20Tatuap%C3%A9&dropoff[formatted_address]=Rua%20Serra%20de%20Japi%2C%201280%20-%20Tatuap%C3%A9%2C%20S%C3%A3o%20Paulo",
  },
  mapa: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.5!2d-46.5756!3d-23.5444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRua+Serra+de+Japi%2C+1280+-+Tatuap%C3%A9%2C+S%C3%A3o+Paulo+-+SP!5e0!3m2!1spt-BR!2sbr!4v1",
    direcoes:
      "https://www.google.com/maps/dir//Rua+Serra+de+Japi,+1280+-+Tatuap%C3%A9,+S%C3%A3o+Paulo+-+SP",
  },
  destaques: [
    {
      nome: "Glazed Clássico",
      descricao: "O queridinho de todos — cobertura fina e crocante que derrete na boca.",
      imagem: "/donut-glazed.jpg",
    },
    {
      nome: "Chocolate Belga",
      descricao: "Cobertura generosa de chocolate belga com sprinkles coloridos.",
      imagem: "/donut-chocolate.jpg",
    },
    {
      nome: "Frutas Vermelhas",
      descricao: "Morango, framboesa e mirtilo frescos com glacê artesanal.",
      imagem: "/donut-morango.jpg",
    },
  ],
  seo: {
    title: "Melhor Bocado Café Tatuapé | Donuts Americanos",
    description:
      "Donuts americanos artesanais no Tatuapé, São Paulo. Massa leve, coberturas premium, café especial. Peça pelo iFood ou visite nossa loja na Rua Serra de Japi, 1280.",
    ogImage: "/donuts-hero.jpg",
  },
  franquia: {
    site: "https://melhorbocado.com.br",
    nome: "Melhor Bocado",
  },
  geo: {
    latitude: -23.5444,
    longitude: -46.5756,
  },
} as const;

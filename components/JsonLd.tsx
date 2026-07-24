import { LOJA } from "@/lib/config";

export function JsonLdLocalBusiness() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "#localbusiness",
    name: LOJA.nome,
    description: LOJA.seo.description,
    image: LOJA.seo.ogImage,
    telephone: `+${LOJA.telefone}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua Serra de Japi, 1280",
      addressLocality: "São Paulo",
      addressRegion: "SP",
      postalCode: "03040-000",
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: LOJA.geo.latitude,
      longitude: LOJA.geo.longitude,
    },
    url: LOJA.franquia.site,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "18:00",
      },
    ],
    servesCuisine: ["Donuts", "Café", "Confeitaria"],
    priceRange: "$$",
    sameAs: [LOJA.links.instagram, LOJA.links.tiktok],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface JsonLdArticleProps {
  titulo: string;
  resumo: string;
  imagem: string;
  data: string;
  slug: string;
}

export function JsonLdArticle({
  titulo,
  resumo,
  imagem,
  data,
  slug,
}: JsonLdArticleProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: titulo,
    description: resumo,
    image: imagem,
    datePublished: data,
    dateModified: data,
    author: {
      "@type": "Organization",
      name: LOJA.nomeCurto,
    },
    publisher: {
      "@type": "Organization",
      name: LOJA.nomeCurto,
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/novidades/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

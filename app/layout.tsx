import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import ConditionalHeader from "@/components/ConditionalHeader";
import { LOJA } from "@/lib/config";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: LOJA.seo.title,
    template: `%s | ${LOJA.nomeCurto}`,
  },
  description: LOJA.seo.description,
  keywords: [
    "donuts",
    "donuts americanos",
    "café",
    "Tatuapé",
    "São Paulo",
    "Melhor Bocado",
    "donut delivery",
    "confeitaria",
    "donuts artesanais",
  ],
  openGraph: {
    title: LOJA.seo.title,
    description: LOJA.seo.description,
    images: [{ url: LOJA.seo.ogImage, width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
    siteName: LOJA.nome,
  },
  twitter: {
    card: "summary_large_image",
    title: LOJA.seo.title,
    description: LOJA.seo.description,
    images: [LOJA.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${inter.variable}`}>
      <body className="bg-white text-gray-900 antialiased">
        <ConditionalHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
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
  metadataBase: new URL("https://melhorbocadocafe.vercel.app"),
  title: {
    default: "Melhor Bocado — Programa de Fidelidade & Roleta da Sorte",
    template: `%s | ${LOJA.nomeCurto}`,
  },
  description: "Sistema oficial de fidelidade, roleta de prêmios e recompensas da Melhor Bocado Café.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Melhor Bocado Café — Fidelidade & Roleta de Prêmios",
    description: "Gire a roleta e ganhe prêmios e descontos exclusivos a cada compra na Melhor Bocado Café!",
    url: "https://melhorbocadocafe.vercel.app",
    siteName: "Melhor Bocado Café",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Melhor Bocado Café Logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melhor Bocado Café — Fidelidade & Roleta de Prêmios",
    description: "Sistema oficial de fidelidade, roleta de prêmios e recompensas da Melhor Bocado Café.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
      </head>
      <body className="bg-white text-gray-900 antialiased min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  );
}

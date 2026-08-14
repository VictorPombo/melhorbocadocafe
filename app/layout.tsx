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
  title: {
    default: "Melhor Bocado — Programa de Fidelidade & Roleta da Sorte",
    template: `%s | ${LOJA.nomeCurto}`,
  },
  description: "Sistema oficial de fidelidade, roleta de prêmios e recompensas da Melhor Bocado Café.",
  robots: {
    index: false,
    follow: false,
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
      <body className="bg-white text-gray-900 antialiased min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  );
}

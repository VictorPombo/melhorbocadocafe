import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import { Gift, RotateCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Melhor Bocado — Programa de Fidelidade & Roleta",
  description: "Gire a roleta e ganhe prêmios exclusivos na Melhor Bocado!",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Melhor Bocado — Programa de Fidelidade & Roleta",
    description: "Gire a roleta e ganhe prêmios e descontos exclusivos na Melhor Bocado Café!",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Melhor Bocado Café",
      },
    ],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function FidelidadeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-[100dvh] bg-gradient-to-b from-[#fff5f9] via-white to-[#fff0f5] flex flex-col"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Top Bar Sofisticada & Discreta do Clube de Fidelidade */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-pink-100/80 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <Link href="/fidelidade/girar" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="Melhor Bocado"
            width={110}
            height={48}
            className="h-8.5 w-auto transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/fidelidade/meus-cupons"
            className="px-3.5 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#e6398f] font-extrabold text-xs border border-pink-200/80 transition-all flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Meus Cupons</span>
          </Link>

          <Link
            href="/fidelidade/girar"
            className="px-3 py-1.5 rounded-full bg-[#e6398f] hover:bg-[#b51e6c] text-white font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Girar Roleta</span>
          </Link>
        </div>
      </header>

      {children}
    </div>
  );
}

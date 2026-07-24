import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Melhor Bocado — Programa de Fidelidade",
  description: "Gire a roleta e ganhe prêmios na Melhor Bocado!",
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
      {children}
    </div>
  );
}

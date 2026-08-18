import type { Metadata } from "next";
import AuthGuard from "@/components/gestao/AuthGuard";
import GestaoClientLayout from "@/components/gestao/GestaoClientLayout";

export const metadata: Metadata = {
  title: "Painel de Gestão | Melhor Bocado Café",
  description: "Painel de gestão da rede Melhor Bocado Café e Sistema de Fidelidade.",
  icons: {
    icon: "/logo.png?v=2",
    apple: "/logo.png?v=2",
  },
  openGraph: {
    title: "Painel de Gestão | Melhor Bocado Café",
    description: "Painel de gestão da rede Melhor Bocado Café e Sistema de Fidelidade.",
    images: [
      {
        url: "/logo.png?v=2",
        width: 800,
        height: 800,
        alt: "Melhor Bocado Café",
      },
    ],
  },
  robots: { index: false, follow: false },
};

export default function GestaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <GestaoClientLayout>
        {children}
      </GestaoClientLayout>
    </AuthGuard>
  );
}

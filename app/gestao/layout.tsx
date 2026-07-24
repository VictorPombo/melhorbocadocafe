import type { Metadata } from "next";
import AuthGuard from "@/components/gestao/AuthGuard";
import GestaoClientLayout from "@/components/gestao/GestaoClientLayout";

export const metadata: Metadata = {
  title: "Painel | Melhor Bocado",
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

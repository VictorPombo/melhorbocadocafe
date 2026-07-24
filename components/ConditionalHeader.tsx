"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Não renderiza o Header principal nas rotas de gestão e fidelidade
  if (pathname.startsWith("/gestao") || pathname.startsWith("/fidelidade")) {
    return null;
  }

  return <Header />;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isLoginPage = pathname === "/gestao/login";
    const isAuthed = localStorage.getItem("mb_auth") === "true";
    const role = localStorage.getItem("mb_role");

    // 1. Não autenticado tentando acessar página protegida
    if (!isAuthed && !isLoginPage) {
      setAuthorized(false);
      const redirectParam = encodeURIComponent(pathname);
      window.location.href = `/gestao/login?redirect=${redirectParam}`;
      return;
    }

    // 2. Perfil "Caixa" tentando acessar outras áreas além do caixa
    if (isAuthed && role === "caixa" && !pathname.startsWith("/gestao/fidelidade/caixa")) {
      router.replace("/gestao/fidelidade/caixa");
      return;
    }

    // 3. Usuário autorizado
    setAuthorized(true);
  }, [pathname, router]);

  if (!authorized && pathname !== "/gestao/login") {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-4 border-[#e6398f] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-300">Validando credenciais de segurança...</p>
      </div>
    );
  }

  return <>{children}</>;
}

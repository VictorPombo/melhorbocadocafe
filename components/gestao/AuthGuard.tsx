"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === "/gestao/login") {
      setAuthorized(true);
      return;
    }

    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const cookieAuth = getCookie("mb_auth") === "true";
    const localAuth = typeof window !== "undefined" && localStorage.getItem("mb_auth") === "true";
    const isAuthed = cookieAuth || localAuth;

    // Se estiver autenticado por cookie mas não no localStorage, ressincroniza
    if (cookieAuth && !localAuth && typeof window !== "undefined") {
      localStorage.setItem("mb_auth", "true");
      localStorage.setItem("mb_role", getCookie("mb_role") || "admin");
      localStorage.setItem("mb_unidade_id", getCookie("mb_unidade_id") || "todas");
      localStorage.setItem("mb_unidade_nome", getCookie("mb_unidade_nome") || "Rede Consolidada");
      localStorage.setItem("mb_caixa", getCookie("mb_caixa") || "Caixa 01");
    }

    // Se estiver autenticado no localStorage mas não no cookie, ressincroniza
    if (localAuth && !cookieAuth && typeof document !== "undefined") {
      const maxAge = 7 * 24 * 60 * 60;
      const r = localStorage.getItem("mb_role") || "admin";
      const uid = localStorage.getItem("mb_unidade_id") || "todas";
      const unome = localStorage.getItem("mb_unidade_nome") || "Rede Consolidada";
      const caixa = localStorage.getItem("mb_caixa") || "Caixa 01";

      document.cookie = `mb_auth=true; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `mb_role=${encodeURIComponent(r)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `mb_unidade_id=${encodeURIComponent(uid)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `mb_unidade_nome=${encodeURIComponent(unome)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `mb_caixa=${encodeURIComponent(caixa)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }

    const role = (typeof window !== "undefined" ? localStorage.getItem("mb_role") : null) || getCookie("mb_role");

    // 1. Se não estiver autenticado em nenhuma camada
    if (!isAuthed) {
      setAuthorized(false);
      const redirectParam = encodeURIComponent(pathname);
      router.replace(`/gestao/login?redirect=${redirectParam}`);
      return;
    }

    // 2. Perfil "Caixa" tentando acessar outras áreas além do caixa
    if (role === "caixa" && !pathname.startsWith("/gestao/fidelidade/caixa")) {
      router.replace("/gestao/fidelidade/caixa");
      return;
    }

    // 3. Autorizado com sucesso
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

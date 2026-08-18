"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Gift,
  ShoppingCart,
  Users,
  Smartphone,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/gestao/fidelidade",
    label: "Fidelidade & Roleta",
    mobileLabel: "Fidelidade",
    icon: <Gift className="w-5 h-5" />,
    badge: "Principal",
  },
  {
    href: "/gestao/fidelidade/caixa",
    label: "Painel do Caixa",
    mobileLabel: "Caixa",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    href: "/gestao/fidelidade/clientes",
    label: "Base de Clientes",
    mobileLabel: "Clientes",
    icon: <Users className="w-5 h-5" />,
  },
];

type NavItem = {
  href: string;
  label: string;
  mobileLabel: string;
  icon: React.ReactNode;
  badge?: string;
};

export default function Sidebar() {
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("mb_auth");
    localStorage.removeItem("mb_role");
    localStorage.removeItem("mb_unidade_id");
    localStorage.removeItem("mb_unidade_nome");
    localStorage.removeItem("mb_caixa");

    document.cookie = "mb_auth=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "mb_role=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "mb_unidade_id=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "mb_unidade_nome=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "mb_caixa=; path=/; max-age=0; SameSite=Lax";

    window.location.href = "/gestao/login";
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/gestao/fidelidade" && pathname.startsWith(href));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 z-40 shadow-xs">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <Link href="/gestao/fidelidade" className="block group shrink-0">
            <Image
              src="/logo.png?v=2"
              alt="Melhor Bocado Café"
              width={48}
              height={48}
              className="h-11 w-11 object-contain transition-transform group-hover:scale-105"
              priority
            />
          </Link>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-gray-900 leading-tight truncate">
              Melhor Bocado
            </span>
            <span className="px-2 py-0.5 mt-1 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 text-[#e6398f] text-[9px] font-black uppercase tracking-wider border border-pink-200/60 shadow-2xs w-fit">
              ☕ Painel de Gestão
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                  active
                    ? "bg-[#e6398f] text-white shadow-md shadow-pink-500/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-pink-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={active ? "text-white" : "text-gray-400"}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && !active && (
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-100 text-[#e6398f] text-[9px] font-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/fidelidade/girar?unidade=tatuape"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-black hover:bg-stone-800 transition-all shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-300" />
            <span>Simular Roleta</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg"
        aria-label="Navegação mobile"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
                  active
                    ? "text-[#e6398f] font-black"
                    : "text-gray-400 hover:text-gray-600 font-bold"
                }`}
              >
                {item.icon}
                <span className="text-[10px]">{item.mobileLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

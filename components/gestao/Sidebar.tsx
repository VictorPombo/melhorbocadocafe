"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Lightbulb, ShieldAlert, Package, Megaphone, Clock, BarChart2, Gift } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/gestao",
    label: "Dashboard",
    mobileLabel: "Home",
    exact: true,
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    href: "/gestao/fidelidade/caixa",
    label: "Painel do Caixa",
    mobileLabel: "Caixa",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    href: "/gestao/clientes",
    label: "Clientes",
    mobileLabel: "Clientes",
    icon: <Users className="w-5 h-5" />,
  },
  { type: "divider" as const },
  {
    href: "/gestao/fidelidade",
    label: "Fidelidade & CRM",
    mobileLabel: "Fidelidade",
    icon: <Gift className="w-5 h-5" />,
    subItems: [
      { href: "/gestao/fidelidade", label: "Dashboard" },
      { href: "/gestao/fidelidade/roleta", label: "Configurar Roleta" },
      { href: "/gestao/fidelidade/historico", label: "Histórico" },
      { href: "/gestao/fidelidade/clientes", label: "Clientes" },
      { href: "/gestao/fidelidade/automacoes", label: "Automações" },
    ],
  },
  {
    href: "/gestao/insights",
    label: "Insights",
    mobileLabel: "Insights",
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    href: "/gestao/inteligencia",
    label: "VIP & Risco",
    mobileLabel: "VIP",
    icon: <ShieldAlert className="w-5 h-5" />,
  },
  {
    href: "/gestao/produtos",
    label: "Produtos",
    mobileLabel: "Produtos",
    icon: <Package className="w-5 h-5" />,
  },
  {
    href: "/gestao/canais",
    label: "Canais",
    mobileLabel: "Canais",
    icon: <Megaphone className="w-5 h-5" />,
  },
  {
    href: "/gestao/horarios",
    label: "Horários",
    mobileLabel: "Horas",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    href: "/gestao/relatorios",
    label: "Relatórios",
    mobileLabel: "Análises",
    icon: <BarChart2 className="w-5 h-5" />,
  },
];

type SubItem = {
  href: string;
  label: string;
};

type NavItem = {
  href?: string;
  label?: string;
  mobileLabel?: string;
  exact?: boolean;
  icon?: React.ReactNode;
  type?: "divider";
  subItems?: SubItem[];
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("mb_auth");
    localStorage.removeItem("mb_role");
    window.location.href = "/gestao/login";
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  // Mobile: show only main 4 items
  const mobileItems = (NAV_ITEMS as NavItem[]).filter((i) => !i.type && i.href && ["/gestao", "/gestao/vendas", "/gestao/clientes", "/gestao/relatorios"].includes(i.href));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <Image src="/logo.png" alt="Melhor Bocado" width={140} height={65} className="h-10 w-auto" />
          <p className="text-xs text-gray-400 mt-2 font-medium">Painel Administrativo</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-0.5">
            {(NAV_ITEMS as NavItem[]).map((item, i) => {
              if (item.type === "divider") {
                return <div key={i} className="border-t border-gray-100 my-3" />;
              }
              const parentActive = isActive(item.href!, item.exact);
              return (
                <div key={item.href}>
                  <Link
                    href={item.href!}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      parentActive
                        ? "bg-[#e6398f]/10 text-[#e6398f]"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon && <div className="text-gray-400 group-hover:text-[#e6398f] transition-colors">{item.icon}</div>}
                    <span className="font-bold">{item.label}</span>
                  </Link>
                  {item.subItems && parentActive && (
                    <div className="ml-8 mt-0.5 space-y-0.5">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            pathname === sub.href
                              ? "text-[#e6398f] bg-[#e6398f]/5 font-bold"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-1 py-1 safe-bottom">
        <div className="flex justify-around items-center">
          {mobileItems.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl text-[10px] font-medium transition-all ${
                isActive(item.href!, item.exact)
                  ? "text-[#e6398f]"
                  : "text-gray-400"
              }`}
            >
              {item.icon}
              {item.mobileLabel}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </nav>
    </>
  );
}

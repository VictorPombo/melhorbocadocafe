"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  ShoppingCart,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Bell,
  LogOut,
  Sparkles,
  Crown,
} from "lucide-react";

export default function GestaoTopBar() {
  const pathname = usePathname();
  const [role, setRole] = useState("admin");
  const [unidadeNome, setUnidadeNome] = useState("Rede Consolidada");
  const [unidadeId, setUnidadeId] = useState("todas");

  useEffect(() => {
    setRole(localStorage.getItem("mb_role") || "admin");
    const rawNome = localStorage.getItem("mb_unidade_nome") || "Rede Consolidada";
    const nomeLimpo = rawNome.replace(/\(Matriz\)/gi, "").replace(/\s+/g, " ").trim();
    setUnidadeNome(nomeLimpo);
    setUnidadeId(localStorage.getItem("mb_unidade_id") || "todas");
  }, []);

  function handleLogout() {
    localStorage.removeItem("mb_auth");
    localStorage.removeItem("mb_role");
    localStorage.removeItem("mb_unidade_id");
    localStorage.removeItem("mb_unidade_nome");
    localStorage.removeItem("mb_caixa");
    window.location.href = "/gestao/login";
  }

  const isAdmin = role === "admin";
  const isFranquia = role === "franquia";
  const isCaixa = role === "caixa";

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Lado Esquerdo: Identificação da Loja e Perfil */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-stone-900 text-white text-xs font-black shadow-xs">
            {isAdmin ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Geral • Rede Completa</span>
              </>
            ) : isFranquia ? (
              <>
                <Store className="w-3.5 h-3.5 text-pink-400" />
                <span>Franquia • {unidadeNome}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Caixa • {unidadeNome}</span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema Online</span>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas & Perfil */}
        <div className="flex items-center gap-2.5">
          {/* Botão Caixa */}
          <Link
            href="/gestao/fidelidade/caixa"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black transition-all cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-gray-600" />
            <span>Painel do Caixa</span>
          </Link>

          {/* Botão Testar Roleta no Balcão */}
          <Link
            href={`/fidelidade/girar?unidade=${unidadeId === "todas" ? "tatuape" : unidadeId}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e6398f] to-rose-500 text-white text-xs font-black shadow-sm shadow-pink-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simular Roleta</span>
          </Link>

          <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />

          {/* Perfil & Logout */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e6398f] to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {isAdmin ? "AD" : isFranquia ? "FQ" : "CX"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-black text-gray-900 leading-tight">
                {isAdmin ? "Admin Geral" : isFranquia ? `Gestor (${unidadeNome})` : "Operador"}
              </p>
              <p className="text-[10px] text-gray-400 font-bold">
                {isAdmin ? "Rede Consolidada" : unidadeNome}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sair do Painel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

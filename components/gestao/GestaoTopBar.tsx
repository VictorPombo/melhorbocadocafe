"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Plus,
} from "lucide-react";

export default function GestaoTopBar() {
  const pathname = usePathname();
  const [role, setRole] = useState("admin");
  const [unidadeNome, setUnidadeNome] = useState("Rede Consolidada");
  const [unidadeId, setUnidadeId] = useState("todas");
  const [listaLojas, setListaLojas] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    setRole(localStorage.getItem("mb_role") || "admin");
    const rawNome = localStorage.getItem("mb_unidade_nome") || "Rede Consolidada";
    const nomeLimpo = rawNome.replace(/\(Matriz\)/gi, "").replace(/\s+/g, " ").trim();
    setUnidadeNome(nomeLimpo);
    setUnidadeId(localStorage.getItem("mb_unidade_id") || "todas");

    fetch("/api/fidelidade/unidades")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.unidades)) {
          setListaLojas(data.unidades);
        }
      })
      .catch(() => {});
  }, []);

  function handleTrocarLoja(novoId: string) {
    let novoNome = "Rede Consolidada";
    if (novoId !== "todas") {
      const achou = listaLojas.find((u) => u.id === novoId);
      if (achou) novoNome = achou.nome;
    }

    setUnidadeId(novoId);
    setUnidadeNome(novoNome);

    localStorage.setItem("mb_unidade_id", novoId);
    localStorage.setItem("mb_unidade_nome", novoNome);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mb_loja_changed", { detail: { id: novoId, nome: novoNome } })
      );
    }
  }

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

  const isAdmin = role === "admin";
  const isFranquia = role === "franquia";
  const isCaixa = role === "caixa";

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Lado Esquerdo: Logo Oficial + Seletor de Loja no Topo */}
        <div className="flex items-center gap-3">
          <Link href="/gestao/fidelidade" className="flex items-center gap-2.5 group shrink-0" title="Melhor Bocado Café">
            <Image
              src="/logo.png"
              alt="Melhor Bocado Café"
              width={36}
              height={36}
              className="h-8.5 w-8.5 object-contain transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-extrabold text-sm text-gray-900 hidden sm:inline-block">Melhor Bocado Café</span>
          </Link>

          <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />

          {/* Seletor Superior de Lojas (Geral vs. Lojas Separadas) */}
          {isAdmin ? (
            <div className="relative flex items-center">
              <select
                id="topbar-store-select"
                aria-label="Selecionar Loja Ativa"
                value={unidadeId}
                onChange={(e) => handleTrocarLoja(e.target.value)}
                className="bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-black py-1.5 pl-3 pr-8 rounded-2xl border border-stone-800 shadow-xs outline-none cursor-pointer transition-all appearance-none"
              >
                <option value="todas">🌐 Todas as Lojas (GERAL)</option>
                {listaLojas.map((u) => (
                  <option key={u.id} value={u.id}>
                    📍 {u.nome}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 text-amber-300 text-[10px]">
                ▼
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-stone-900 text-white text-xs font-black shadow-xs">
              <Store className="w-3.5 h-3.5 text-pink-400" />
              <span>Franquia • {unidadeNome}</span>
            </div>
          )}

          {/* Botão + Cadastrar Nova Loja no Topo (Exclusivo Admin) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("mb_abrir_modal_nova_loja"));
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Cadastrar Nova Loja</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema Online</span>
          </div>
        </div>

        {/* Lado Direito: Perfil & Logout */}
        <div className="flex items-center gap-2.5">
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

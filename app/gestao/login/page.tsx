"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Store, ShoppingCart, Lock, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { UNIDADES_LOJA, UnidadeLoja } from "@/lib/fidelidade/types";

type TipoPerfil = "admin" | "franquia" | "caixa";

export default function LoginPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<TipoPerfil>("admin");
  const [unidades, setUnidades] = useState<UnidadeLoja[]>(UNIDADES_LOJA);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>("tatuape");
  const [caixaSelecionado, setCaixaSelecionado] = useState<string>("Caixa 01");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Carregar lojas ativas dinamicamente
  useEffect(() => {
    fetch("/api/fidelidade/unidades")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.unidades) && data.unidades.length > 0) {
          setUnidades(data.unidades);
          setUnidadeSelecionada(data.unidades[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const unidadeAtual = unidades.find((u) => u.id === unidadeSelecionada) || unidades[0];

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    setTimeout(() => {
      const cleanSenha = senha.trim();

      // Validação por perfil
      let authed = false;
      let roleToSave = perfil;
      let unidadeIdToSave = "todas";
      let unidadeNomeToSave = "Rede Consolidada";

      if (perfil === "admin") {
        if (cleanSenha === "admin" || cleanSenha === "admin123" || cleanSenha === "1234") {
          authed = true;
          roleToSave = "admin";
          unidadeIdToSave = "todas";
          unidadeNomeToSave = "Rede Consolidada (Master)";
        } else {
          setErro("Senha do Admin Geral incorreta. (Padrão: admin)");
        }
      } else if (perfil === "franquia") {
        // Aceita senhas padrão de franquia ou admin
        if (
          cleanSenha === "franquia123" ||
          cleanSenha === "admin" ||
          cleanSenha === "1234" ||
          cleanSenha === `${unidadeSelecionada}123`
        ) {
          authed = true;
          roleToSave = "franquia";
          unidadeIdToSave = unidadeAtual?.id || "tatuape";
          unidadeNomeToSave = unidadeAtual?.nome || "Franquia";
        } else {
          setErro("Senha da Franquia incorreta. (Padrão: franquia123)");
        }
      } else if (perfil === "caixa") {
        if (cleanSenha === "1234" || cleanSenha === "caixa123" || cleanSenha === "admin") {
          authed = true;
          roleToSave = "caixa";
          unidadeIdToSave = unidadeAtual?.id || "tatuape";
          unidadeNomeToSave = unidadeAtual?.nome || "Franquia";
        } else {
          setErro("PIN do Caixa incorreto. (Padrão: 1234)");
        }
      }

      if (authed) {
        // Grava no localStorage para a interface cliente
        localStorage.setItem("mb_auth", "true");
        localStorage.setItem("mb_role", roleToSave);
        localStorage.setItem("mb_unidade_id", unidadeIdToSave);
        localStorage.setItem("mb_unidade_nome", unidadeNomeToSave);
        localStorage.setItem("mb_caixa", caixaSelecionado);

        // Grava cookies para o Next.js Middleware validar no servidor (7 dias de validade)
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `mb_auth=true; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `mb_role=${encodeURIComponent(roleToSave)}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `mb_unidade_id=${encodeURIComponent(unidadeIdToSave)}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `mb_unidade_nome=${encodeURIComponent(unidadeNomeToSave)}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `mb_caixa=${encodeURIComponent(caixaSelecionado)}; path=/; max-age=${maxAge}; SameSite=Lax`;

        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get("redirect");

        if (roleToSave === "caixa") {
          window.location.href = "/gestao/fidelidade/caixa";
        } else if (redirectTo && redirectTo.startsWith("/gestao") && redirectTo !== "/gestao/login") {
          window.location.href = redirectTo;
        } else {
          window.location.href = "/gestao/fidelidade";
        }
      } else {
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#0c0a09] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Luzes decorativas de fundo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#e6398f]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header e Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 mb-4 shadow-xl">
            <Image
              src="/logo.png"
              alt="Melhor Bocado"
              width={160}
              height={75}
              className="h-12 w-auto drop-shadow-md"
              priority
            />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Portal de Gestão & Franquias</h1>
          <p className="text-white/60 text-xs font-medium mt-1">
            Sistema Unificado de Fidelidade e Roleta
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-6 animate-scale-up">
          {/* Seletor de Perfil Segmentado */}
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase mb-2 tracking-wider">
              Selecione seu Perfil de Acesso
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setPerfil("admin");
                  setErro("");
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  perfil === "admin"
                    ? "bg-stone-900 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-stone-200/60"
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${perfil === "admin" ? "text-amber-400" : "text-gray-400"}`} />
                <span className="truncate">Admin Geral</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPerfil("franquia");
                  setErro("");
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  perfil === "franquia"
                    ? "bg-gradient-to-r from-[#e6398f] to-rose-600 text-white shadow-sm shadow-pink-500/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-stone-200/60"
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="truncate">Franquia</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPerfil("caixa");
                  setErro("");
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  perfil === "caixa"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-stone-200/60"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="truncate">Caixa</span>
              </button>
            </div>
          </div>

          {/* Contexto do Perfil */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">
              {perfil === "admin" ? "👑" : perfil === "franquia" ? "🏪" : "💳"}
            </span>
            <div className="flex-1">
              <p className="font-bold text-stone-900">
                {perfil === "admin"
                  ? "Administrador Geral (Rede)"
                  : perfil === "franquia"
                  ? "Gestor de Franquia / Loja"
                  : "Operador de Caixa do Balcão"}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {perfil === "admin"
                  ? "Visão consolidada de todas as lojas, métricas globais e cadastro de novas franquias."
                  : perfil === "franquia"
                  ? "Painel restrito para gerenciar a operação e métricas da unidade escolhida."
                  : "Terminal de atendimento para validação rápida de cupons da roleta."}
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Seletor de Loja para Franquia ou Caixa */}
            {perfil !== "admin" && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">
                    Selecione a Loja / Franquia *
                  </label>
                  <select
                    value={unidadeSelecionada}
                    onChange={(e) => setUnidadeSelecionada(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none focus:border-[#e6398f] focus:ring-2 focus:ring-pink-100 bg-white"
                  >
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.cidade})
                      </option>
                    ))}
                  </select>
                </div>

                {perfil === "caixa" && (
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">
                      Terminal de Caixa *
                    </label>
                    <select
                      value={caixaSelecionado}
                      onChange={(e) => setCaixaSelecionado(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
                    >
                      {(unidadeAtual?.caixas || ["Caixa 01", "Caixa 02"]).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Campo de Senha / PIN */}
            <div>
              <label htmlFor="senha" className="block text-xs font-black text-gray-700 uppercase mb-1.5">
                {perfil === "admin"
                  ? "Senha do Admin Geral"
                  : perfil === "franquia"
                  ? "Senha da Franquia"
                  : "PIN / Senha do Caixa"}
              </label>
              <div className="relative flex items-center">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setErro("");
                  }}
                  placeholder={perfil === "caixa" ? "PIN (Ex: 1234)" : "••••••••"}
                  autoFocus
                  required
                  className={`w-full px-4 pr-11 py-3 rounded-xl border-2 text-sm font-bold text-gray-900 placeholder-gray-300 outline-none transition-all ${
                    erro
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 focus:border-stone-900 bg-gray-50 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors flex items-center justify-center"
                  title={mostrarSenha ? "Ocultar senha" : "Ver senha digitada"}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Ver senha digitada"}
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-4 h-4 text-[#e6398f]" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-700" />
                  )}
                </button>
              </div>

              {erro && (
                <p className="text-red-500 text-xs mt-1.5 font-bold animate-shake">{erro}</p>
              )}
            </div>

            {/* Botão de Entrar */}
            <button
              type="submit"
              disabled={loading || !senha}
              className={`w-full py-3.5 rounded-2xl font-black text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                perfil === "admin"
                  ? "bg-stone-900 hover:bg-stone-800 shadow-stone-900/25"
                  : perfil === "franquia"
                  ? "bg-gradient-to-r from-[#e6398f] to-rose-600 hover:opacity-95 shadow-pink-500/25"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Acessar Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Dica de Acesso Rápido para Demonstração */}
          <div className="pt-3 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 font-medium">
              🔑 <strong>Senhas Rápidas:</strong> Admin: <code className="text-gray-700 font-bold bg-gray-100 px-1 py-0.5 rounded">admin</code> · Franquia: <code className="text-gray-700 font-bold bg-gray-100 px-1 py-0.5 rounded">franquia123</code> · Caixa: <code className="text-gray-700 font-bold bg-gray-100 px-1 py-0.5 rounded">1234</code>
            </p>
          </div>
        </div>

        <p className="text-center text-white/40 text-[11px] mt-6">
          Melhor Bocado Café © Sistema de Fidelidade Multi-Loja
        </p>
      </div>
    </div>
  );
}

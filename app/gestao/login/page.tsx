"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"caixa" | "proprietario">("caixa");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(false);

    setTimeout(() => {
      const isProprietarioValid = role === "proprietario" && senha === "admin";
      const isCaixaValid = role === "caixa" && senha === "1234";

      if (isProprietarioValid || isCaixaValid) {
        localStorage.setItem("mb_auth", "true");
        localStorage.setItem("mb_role", role);
        router.replace(role === "caixa" ? "/gestao/fidelidade/caixa" : "/gestao");
      } else {
        setErro(true);
        setLoading(false);
      }
    }, 500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6398f] via-[#b51e6c] to-[#7d0f47] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Melhor Bocado"
            width={160}
            height={75}
            className="h-16 w-auto mx-auto mb-4 drop-shadow-2xl"
          />
          <p className="text-white/70 text-sm font-medium">Painel Administrativo</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/20"
        >
          <h1 className="text-xl font-bold text-gray-800 mb-1">Acesso restrito</h1>
          <p className="text-gray-400 text-sm mb-6">Digite a senha para acessar o painel</p>

          <div className="space-y-4">
            
            {/* Seletor de Perfil */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setRole("caixa")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === "caixa" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Caixa
              </button>
              <button
                type="button"
                onClick={() => setRole("proprietario")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === "proprietario" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Proprietário
              </button>
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-600 mb-1.5">
                Senha {role === "proprietario" ? "do Proprietário" : "do Caixa"}
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro(false); }}
                placeholder="••••"
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border-2 text-gray-800 placeholder-gray-300 outline-none transition-all ${
                  erro
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-gray-200 focus:border-[#e6398f] bg-gray-50 focus:bg-white"
                }`}
              />
              {erro && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">Senha incorreta. Tente novamente.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !senha}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-bold text-sm shadow-lg shadow-[#e6398f]/25 hover:shadow-xl hover:shadow-[#e6398f]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          Unidade Tatuapé · Acesso exclusivo
        </p>
      </div>
    </div>
  );
}

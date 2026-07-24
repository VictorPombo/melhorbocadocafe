"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CANAIS = [
  { valor: "instagram", label: "Instagram" },
  { valor: "tiktok", label: "TikTok" },
  { valor: "google", label: "Google" },
  { valor: "ifood", label: "iFood" },
  { valor: "indicacao", label: "Indicação de amigo" },
  { valor: "passei_em_frente", label: "Passei em frente" },
  { valor: "outro", label: "Outro" },
];

export default function CadastroPage() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState("");
  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [canal, setCanal] = useState("");
  const [lgpd, setLgpd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const wpp = sessionStorage.getItem("fid_whatsapp");
    if (!wpp) {
      router.push("/fidelidade");
      return;
    }
    setWhatsapp(wpp);
  }, [router]);

  // Formata WhatsApp para exibição
  function formatWpp(d: string): string {
    if (d.length >= 11) {
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }
    return d;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Como podemos te chamar?");
      return;
    }
    if (!nascimento) {
      setErro("Precisamos da data de nascimento para surpresas especiais 🎂");
      return;
    }
    if (!canal) {
      setErro("Nos conte como chegou aqui!");
      return;
    }
    if (!lgpd) {
      setErro("É preciso aceitar a política de privacidade para continuar.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("/api/fidelidade/cliente/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          whatsapp,
          nascimento,
          canal_aquisicao: canal,
          aceite_lgpd: lgpd,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Já cadastrado — redireciona pro giro
          sessionStorage.setItem("fid_cliente_id", data.cliente.id);
          sessionStorage.setItem("fid_cliente_nome", data.cliente.nome);
          router.push("/fidelidade/girar");
          return;
        }
        setErro(data.erro || "Algo deu errado. Tente novamente.");
        return;
      }

      // Cadastro OK — vai pro giro
      sessionStorage.setItem("fid_cliente_id", data.cliente.id);
      sessionStorage.setItem("fid_cliente_nome", data.cliente.nome);
      router.push("/fidelidade/girar");
    } catch {
      // Tolerância offline: tenta guardar localmente
      try {
        const pendingData = {
          nome: nome.trim(),
          whatsapp,
          nascimento,
          canal_aquisicao: canal,
          aceite_lgpd: lgpd,
          tentativa_em: new Date().toISOString(),
        };
        localStorage.setItem("fid_cadastro_pendente", JSON.stringify(pendingData));
        setErro(
          "Sem conexão. Seus dados foram salvos e serão enviados quando a internet voltar."
        );
      } catch {
        setErro("Sem conexão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 text-sm mb-4 inline-block"
        >
          ← Voltar
        </button>
        <h1 className="text-xl font-extrabold text-gray-800">
          Bem-vindo! 🎉
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Preencha seus dados para participar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
        {/* WhatsApp (readonly, já preenchido) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            WhatsApp
          </label>
          <div className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-600 text-base font-medium">
            {formatWpp(whatsapp)}
          </div>
        </div>

        {/* Nome */}
        <div>
          <label
            htmlFor="nome"
            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
          >
            Seu nome
          </label>
          <input
            id="nome"
            type="text"
            autoComplete="name"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErro("");
            }}
            placeholder="Como podemos te chamar?"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#e6398f] bg-white outline-none transition-all text-base text-gray-800"
            disabled={loading}
          />
        </div>

        {/* Nascimento */}
        <div>
          <label
            htmlFor="nascimento"
            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
          >
            Data de nascimento
          </label>
          <input
            id="nascimento"
            type="date"
            value={nascimento}
            onChange={(e) => {
              setNascimento(e.target.value);
              setErro("");
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#e6398f] bg-white outline-none transition-all text-base text-gray-800"
            disabled={loading}
          />
        </div>

        {/* Canal de aquisição */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Como conheceu a Melhor Bocado?
          </label>
          <div className="flex flex-wrap gap-2">
            {CANAIS.map((c) => (
              <button
                key={c.valor}
                type="button"
                onClick={() => {
                  setCanal(c.valor);
                  setErro("");
                }}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  canal === c.valor
                    ? "bg-[#e6398f] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                disabled={loading}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* LGPD */}
        <div className="flex items-start gap-3">
          <input
            id="lgpd"
            type="checkbox"
            checked={lgpd}
            onChange={(e) => {
              setLgpd(e.target.checked);
              setErro("");
            }}
            className="mt-1 w-5 h-5 rounded accent-[#e6398f] cursor-pointer"
            disabled={loading}
          />
          <label htmlFor="lgpd" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
            Autorizo a Melhor Bocado a armazenar meus dados pessoais para fins
            de comunicação de promoções e programa de fidelidade. Posso solicitar
            exclusão a qualquer momento.
          </label>
        </div>

        {/* Erro */}
        {erro && (
          <p className="text-red-500 text-sm text-center font-medium bg-red-50 rounded-xl p-3">
            {erro}
          </p>
        )}

        {/* Spacer + Botão fixo no bottom */}
        <div className="flex-1" />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-bold text-base shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[48px]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cadastrando...
            </span>
          ) : (
            "Cadastrar e Girar 🎰"
          )}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CupomItem {
  id: string;
  codigo_cupom: string;
  status: string;
  criado_em: string;
  expira_em: string;
  utilizado_em: string | null;
  premio: { nome: string; tipo: string; valor: number } | null;
}

export default function MeusCuponsPage() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [cupons, setCupons] = useState<CupomItem[] | null>(null);
  const [tab, setTab] = useState<"disponivel" | "utilizado" | "expirado">(
    "disponivel"
  );

  function handleChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    let masked = digits;
    if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 7)
      masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    setWhatsapp(masked);
    setErro("");
  }

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) {
      setErro("Digite um WhatsApp válido com DDD");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("/api/fidelidade/cupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: digits }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(
          res.status === 404
            ? "WhatsApp não encontrado. Faça seu cadastro primeiro!"
            : data.erro || "Algo deu errado."
        );
        return;
      }

      setNomeCliente(data.cliente.nome);
      setCupons(data.cupons);
    } catch {
      setErro("Sem conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Se ainda não buscou, mostra form
  if (cupons === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎫</div>
          <h1 className="text-xl font-extrabold text-gray-800">Meus Cupons</h1>
          <p className="text-sm text-gray-400 mt-1">
            Digite seu WhatsApp para ver seus cupons
          </p>
        </div>

        <form onSubmit={handleBuscar} className="w-full max-w-sm space-y-4">
          <input
            type="tel"
            inputMode="numeric"
            value={whatsapp}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="(31) 99999-9999"
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#e6398f] bg-gray-50 outline-none text-lg text-center font-semibold tracking-wider text-gray-800 placeholder-gray-300"
            disabled={loading}
          />
          {erro && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 rounded-xl p-3">
              {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || whatsapp.replace(/\D/g, "").length < 10}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-bold shadow-lg shadow-pink-500/25 disabled:opacity-50 min-h-[48px]"
          >
            {loading ? "Buscando..." : "Ver meus cupons"}
          </button>
        </form>

        <button
          onClick={() => router.push("/fidelidade")}
          className="mt-4 text-sm text-gray-400 hover:underline"
        >
          ← Voltar ao início
        </button>
      </div>
    );
  }

  // Filtra por tab
  const cuponsFiltrados = cupons.filter((c) => {
    if (tab === "disponivel") return c.status === "disponivel";
    if (tab === "utilizado") return c.status === "utilizado";
    return c.status === "expirado";
  });

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <div className="text-center mb-6">
        <button
          onClick={() => setCupons(null)}
          className="text-gray-400 text-sm mb-3 inline-block"
        >
          ← Voltar
        </button>
        <h1 className="text-xl font-extrabold text-gray-800">
          Olá, {nomeCliente.split(" ")[0]}! 🎫
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {cupons.length === 0
            ? "Você ainda não tem cupons"
            : `${cupons.length} cupom(s) no total`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
        {(["disponivel", "utilizado", "expirado"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              tab === t
                ? "bg-white text-[#e6398f] shadow-sm"
                : "text-gray-400"
            }`}
          >
            {t === "disponivel"
              ? "Ativos"
              : t === "utilizado"
              ? "Usados"
              : "Expirados"}
          </button>
        ))}
      </div>

      {/* Lista de cupons */}
      <div className="space-y-3 flex-1">
        {cuponsFiltrados.length === 0 && (
          <div className="text-center text-gray-300 py-8">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">Nenhum cupom nesta categoria</p>
          </div>
        )}

        {cuponsFiltrados.map((cupom) => (
          <button
            key={cupom.id}
            onClick={() => router.push(`/fidelidade/premio/${cupom.id}`)}
            className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left flex items-center gap-4 active:scale-[0.98] transition-all"
          >
            <div className="text-2xl">
              {cupom.premio?.tipo === "produto" ? "🍩" : "💰"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">
                {cupom.premio?.nome || "Prêmio"}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {cupom.codigo_cupom}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-bold ${
                  cupom.status === "disponivel"
                    ? "text-green-500"
                    : cupom.status === "utilizado"
                    ? "text-gray-400"
                    : "text-red-400"
                }`}
              >
                {cupom.status === "disponivel"
                  ? "Ativo"
                  : cupom.status === "utilizado"
                  ? "Usado"
                  : "Expirado"}
              </span>
              <p className="text-[10px] text-gray-300 mt-1">
                {new Date(cupom.expira_em).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push("/fidelidade")}
        className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-bold shadow-lg shadow-pink-500/25 min-h-[48px]"
      >
        Girar a roleta novamente
      </button>
    </div>
  );
}

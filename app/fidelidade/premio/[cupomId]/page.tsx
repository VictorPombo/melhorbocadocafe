"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface CupomData {
  cupom: {
    id: string;
    codigo_cupom: string;
    status: string;
    criado_em: string;
    expira_em: string;
    utilizado_em: string | null;
  };
  premio: {
    nome: string;
    tipo: string;
    valor: number;
  } | null;
}

export default function PremioPage({
  params,
}: {
  params: Promise<{ cupomId: string }>;
}) {
  const { cupomId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<CupomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/fidelidade/cupom/${cupomId}`);
        if (!res.ok) {
          setErro("Cupom não encontrado");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setErro("Sem conexão. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cupomId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#e6398f] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (erro || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-500 text-center mb-4">{erro}</p>
        <button
          onClick={() => router.push("/fidelidade")}
          className="py-3 px-6 rounded-2xl bg-[#e6398f] text-white font-bold min-h-[48px]"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  const { cupom, premio } = data;
  const expirado = new Date(cupom.expira_em) < new Date();
  const utilizado = cupom.status === "utilizado";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm">
        {/* Status badge */}
        <div className="text-center mb-6">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              utilizado
                ? "bg-gray-200 text-gray-500"
                : expirado
                ? "bg-red-100 text-red-500"
                : "bg-green-100 text-green-600"
            }`}
          >
            {utilizado
              ? "✓ Utilizado"
              : expirado
              ? "Expirado"
              : "✦ Disponível"}
          </span>
        </div>

        {/* Card do cupom */}
        <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/50 p-6 border border-pink-50 relative overflow-hidden">
          {/* Decoração */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-pink-200 to-transparent rounded-full opacity-50" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-pink-100 to-transparent rounded-full opacity-50" />

          <div className="relative text-center">
            <div className="text-5xl mb-3">
              {premio?.tipo === "produto" ? "🍩" : "💰"}
            </div>
            <h1 className="text-xl font-extrabold text-gray-800 mb-1">
              {premio?.nome || "Prêmio"}
            </h1>
            {premio?.tipo === "desconto" && (
              <p className="text-sm font-bold text-[#e6398f]">
                {premio.valor}% de desconto na sua compra
              </p>
            )}
            {premio?.tipo === "desconto_reais" && (
              <p className="text-sm font-bold text-emerald-600">
                R$ {Number(premio.valor || 0).toFixed(2).replace(".", ",")} de desconto na sua compra
              </p>
            )}

            {/* Código grande */}
            <div className="mt-6 bg-gray-50 rounded-2xl p-5">
              <p className="text-xs text-gray-400 mb-2">Código do cupom</p>
              <p className="text-3xl font-mono font-extrabold text-[#e6398f] tracking-[0.3em]">
                {cupom.codigo_cupom}
              </p>
            </div>

            {/* Datas */}
            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>
                Criado:{" "}
                {new Date(cupom.criado_em).toLocaleDateString("pt-BR")}
              </span>
              <span>
                Válido até:{" "}
                {new Date(cupom.expira_em).toLocaleDateString("pt-BR")}
              </span>
            </div>

            {utilizado && cupom.utilizado_em && (
              <p className="mt-2 text-xs text-gray-400">
                Utilizado em:{" "}
                {new Date(cupom.utilizado_em).toLocaleDateString("pt-BR")}
              </p>
            )}

            {/* Instrução */}
            {!utilizado && !expirado && (
              <div className="mt-5 bg-pink-50 rounded-xl p-3">
                <p className="text-xs text-[#e6398f] font-semibold">
                  📱 Mostre este código no caixa para resgatar seu prêmio
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push("/fidelidade/meus-cupons")}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-bold shadow-lg shadow-pink-500/25 min-h-[48px] active:scale-[0.98] transition-all"
          >
            Ver todos os meus cupons
          </button>
          <button
            onClick={() => router.push("/fidelidade/girar")}
            className="w-full py-3 rounded-2xl text-[#e6398f] hover:bg-pink-50 font-black text-xs transition-all cursor-pointer"
          >
            ← Voltar para a Roleta de Prêmios
          </button>
        </div>
      </div>
    </div>
  );
}

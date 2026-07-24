"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function GirarPage() {
  const router = useRouter();
  const [clienteNome, setClienteNome] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [codigo, setCodigo] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [girando, setGirando] = useState(false);
  const [resultado, setResultado] = useState<{
    premio: { nome: string; tipo: string; valor: number };
    cupom: { id: string; codigo_cupom: string; expira_em: string };
  } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const id = sessionStorage.getItem("fid_cliente_id");
    const nome = sessionStorage.getItem("fid_cliente_nome");
    if (!id) {
      router.push("/fidelidade");
      return;
    }
    setClienteId(id);
    setClienteNome(nome || "");
  }, [router]);

  function handleCodeChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...codigo];
    newCode[index] = digit;
    setCodigo(newCode);
    setErro("");

    // Auto-advance
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleGirar() {
    const codigoStr = codigo.join("");
    if (codigoStr.length !== 4) {
      setErro("Digite o código de 4 dígitos que aparece no caixa");
      return;
    }

    setLoading(true);
    setErro("");
    setGirando(true);

    try {
      // Vibração tátil (Android)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }

      const res = await fetch("/api/fidelidade/girar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          codigo_vinculo: codigoStr,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Algo deu errado. Tente novamente.");
        setGirando(false);
        return;
      }

      // Espera a animação da roleta (2.5s)
      await new Promise((r) => setTimeout(r, 2500));

      setResultado(data);
    } catch {
      setErro("Sem conexão. O giro precisa de internet, tente novamente.");
    } finally {
      setLoading(false);
      setGirando(false);
    }
  }

  // Se já temos resultado, mostra o prêmio
  if (resultado) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="animate-bounce text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
          Parabéns, {clienteNome.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 mb-8">Você ganhou:</p>

        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-pink-100/50 p-6 border border-pink-50">
          <div className="text-4xl mb-3">
            {resultado.premio.tipo === "produto" ? "🍩" : "💰"}
          </div>
          <h2 className="text-xl font-extrabold text-[#e6398f] mb-1">
            {resultado.premio.nome}
          </h2>
          {resultado.premio.tipo === "desconto" && (
            <p className="text-gray-400 text-sm">
              {resultado.premio.valor}% de desconto na próxima compra
            </p>
          )}

          <div className="mt-4 bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Seu código:</p>
            <p className="text-2xl font-mono font-extrabold text-gray-800 tracking-widest">
              {resultado.cupom.codigo_cupom}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Válido até{" "}
              {new Date(resultado.cupom.expira_em).toLocaleDateString("pt-BR")}
            </p>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            📱 Mostre este código no caixa para resgatar
          </p>
        </div>

        <div className="mt-8 space-y-3 w-full max-w-sm">
          <button
            onClick={() =>
              router.push(`/fidelidade/premio/${resultado.cupom.id}`)
            }
            className="w-full py-3 rounded-2xl bg-[#e6398f] text-white font-bold min-h-[48px]"
          >
            Ver detalhes do cupom
          </button>
          <button
            onClick={() => {
              sessionStorage.clear();
              router.push("/fidelidade");
            }}
            className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-medium min-h-[48px]"
          >
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {/* Saudação */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">👋</div>
        <h1 className="text-xl font-extrabold text-gray-800">
          {clienteNome ? (
            <>
              Olá, <span className="text-[#e6398f]">{clienteNome.split(" ")[0]}</span>!
            </>
          ) : (
            "Olá!"
          )}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Digite o código que aparece no caixa
        </p>
      </div>

      {/* Inputs do código de 4 dígitos */}
      <div className="flex gap-3 mb-6">
        {codigo.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-16 h-20 text-center text-3xl font-extrabold rounded-2xl border-2 outline-none transition-all ${
              digit
                ? "border-[#e6398f] bg-pink-50 text-[#e6398f]"
                : "border-gray-200 bg-white text-gray-800"
            } focus:border-[#e6398f] focus:ring-2 focus:ring-pink-200`}
            disabled={loading}
          />
        ))}
      </div>

      {/* Erro */}
      {erro && (
        <p className="text-red-500 text-sm text-center font-medium mb-4 bg-red-50 rounded-xl px-4 py-2 max-w-sm">
          {erro}
        </p>
      )}

      {/* Roleta visual */}
      {girando && (
        <div className="mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-dashed border-[#e6398f] animate-spin flex items-center justify-center">
            <span className="text-4xl animate-pulse">🎰</span>
          </div>
        </div>
      )}

      {/* Botão girar */}
      <button
        onClick={handleGirar}
        disabled={loading || codigo.join("").length !== 4}
        className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-bold text-lg shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[48px]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Girando a roleta...
          </span>
        ) : (
          "Girar a Roleta! 🎰"
        )}
      </button>

      <button
        onClick={() => router.back()}
        className="mt-4 text-sm text-gray-400 hover:underline"
      >
        ← Voltar
      </button>
    </div>
  );
}

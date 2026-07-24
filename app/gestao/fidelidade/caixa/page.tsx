"use client";

import { useState, useEffect, useCallback } from "react";

export default function CaixaFidelidadePage() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [expiraEm, setExpiraEm] = useState<string | null>(null);
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  
  // Estado do validador de cupons
  const [cupomInput, setCupomInput] = useState("");
  const [validacaoStatus, setValidacaoStatus] = useState<"idle" | "valido" | "invalido">("idle");
  const [cupomInfo, setCupomInfo] = useState<{ premio: string; cliente: string } | null>(null);

  // Gera novo código
  const gerarCodigo = useCallback(async () => {
    setLoadingCodigo(true);
    try {
      const res = await fetch("/api/fidelidade/codigo-vinculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loja: "loja_1", caixa: "1" }),
      });
      const data = await res.json();
      if (data.sucesso) {
        setCodigo(data.codigo);
        setExpiraEm(data.expira_em);
      }
    } catch {
      // Falha silenciosa
    } finally {
      setLoadingCodigo(false);
    }
  }, []);

  // Gera código inicial
  useEffect(() => {
    gerarCodigo();
  }, [gerarCodigo]);

  // Timer de renovação automática (a cada 2 min pra simplificar a visão do caixa)
  useEffect(() => {
    const interval = setInterval(() => {
      gerarCodigo();
    }, 120000); // 2 minutos
    return () => clearInterval(interval);
  }, [gerarCodigo]);

  // Função mockada para validar cupom
  function handleValidarCupom(e: React.FormEvent) {
    e.preventDefault();
    if (!cupomInput.trim()) return;

    // Lógica mockada: se tiver 6 caracteres, assume válido para apresentação
    if (cupomInput.length >= 5) {
      setValidacaoStatus("valido");
      setCupomInfo({ premio: "Donut Tradicional", cliente: "Cliente Exemplo" });
    } else {
      setValidacaoStatus("invalido");
      setCupomInfo(null);
    }
  }

  function handleUsarCupom() {
    alert("Cupom marcado como utilizado!");
    setCupomInput("");
    setValidacaoStatus("idle");
    setCupomInfo(null);
  }

  function handleSair() {
    localStorage.removeItem("mb_auth");
    localStorage.removeItem("mb_role");
    window.location.href = "/gestao/login";
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row relative">
      <button 
        onClick={handleSair}
        className="absolute top-4 right-4 px-4 py-2 bg-gray-800 text-gray-400 text-xs font-bold rounded-lg hover:bg-gray-700 hover:text-white transition-all z-10"
      >
        Sair
      </button>

      {/* LADO ESQUERDO: GERADOR DE CÓDIGO */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-800">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-6 font-bold text-center">
          Código para a Roleta
        </p>

        {loadingCodigo ? (
          <div className="animate-pulse w-64 h-24 bg-gray-800 rounded-2xl" />
        ) : (
          <div className="bg-gray-900 rounded-3xl px-12 py-8 border border-gray-800 shadow-2xl shadow-pink-500/10 mb-8">
            <p className="text-8xl font-mono font-extrabold tracking-[0.3em] text-[#e6398f] text-center">
              {codigo || "----"}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 max-w-xs text-center mb-6">
          Peça para o cliente escanear o QR Code no balcão e digitar este código no celular.
        </p>

        <button
          onClick={gerarCodigo}
          disabled={loadingCodigo}
          className="px-6 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium text-sm hover:bg-gray-700 transition-all active:scale-[0.98]"
        >
          🔄 Gerar novo código
        </button>
      </div>

      {/* LADO DIREITO: VALIDADOR DE CUPOM */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900/50">
        <div className="w-full max-w-md">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-6 font-bold text-center">
            Validar Cupom
          </p>

          <form onSubmit={handleValidarCupom} className="flex gap-2 mb-6">
            <input
              type="text"
              value={cupomInput}
              onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
              placeholder="Ex: A3F7K2"
              className="flex-1 px-4 py-4 rounded-xl border border-gray-700 bg-gray-900 focus:border-[#e6398f] outline-none transition-all text-xl font-mono text-white placeholder-gray-600 uppercase"
            />
            <button
              type="submit"
              className="px-6 py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Resultado da Validação */}
          {validacaoStatus === "invalido" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
              <p className="text-red-400 font-bold">Cupom inválido ou expirado</p>
            </div>
          )}

          {validacaoStatus === "valido" && cupomInfo && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  ✓
                </div>
                <p className="text-green-400 font-bold text-lg">Cupom Válido</p>
              </div>
              
              <div className="space-y-3 bg-gray-900/50 rounded-xl p-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500">Prêmio</p>
                  <p className="text-lg font-bold text-white">{cupomInfo.premio}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="text-sm text-gray-300">{cupomInfo.cliente}</p>
                </div>
              </div>

              <button
                onClick={handleUsarCupom}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/20 transition-all active:scale-[0.98]"
              >
                Confirmar Entrega do Prêmio
              </button>
            </div>
          )}

          {validacaoStatus === "idle" && (
            <p className="text-xs text-gray-600 text-center">
              Digite o código do cupom que o cliente apresentar no celular para validar a entrega do prêmio.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

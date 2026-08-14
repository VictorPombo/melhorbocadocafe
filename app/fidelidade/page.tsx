"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FidelidadePage() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Máscara para WhatsApp: (XX) XXXXX-XXXX
  function handleChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    let masked = digits;
    if (digits.length > 2) {
      masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length > 7) {
      masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    setWhatsapp(masked);
    setErro("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = whatsapp.replace(/\D/g, "");

    if (digits.length < 10) {
      setErro("Digite um WhatsApp válido com DDD");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("/api/fidelidade/cliente/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: digits }),
      });

      const data = await res.json();

      // Salva no sessionStorage (nunca na URL)
      sessionStorage.setItem("fid_whatsapp", digits);

      if (data.encontrado) {
        // Cliente existente → vai pro giro
        sessionStorage.setItem("fid_cliente_id", data.cliente.id);
        sessionStorage.setItem("fid_cliente_nome", data.cliente.nome);
        router.push("/fidelidade/girar");
      } else {
        // Cliente novo → cadastro
        router.push("/fidelidade/cadastro");
      }
    } catch {
      setErro("Sem conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {/* Logo / Marca */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🍩</div>
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
          Melhor Bocado
        </h1>
        <p className="text-sm text-gray-400 mt-1">Programa de Fidelidade</p>
      </div>

        {/* Card principal */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/50 p-6 border border-pink-50 text-center">
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">
              Gire a roleta e ganhe! 🎉
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Escaneou o QR Code? Preencha seu nome e gire para resgatar seu prêmio.
            </p>

            <button
              onClick={() => router.push("/fidelidade/girar")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] text-white font-black text-lg shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 active:scale-[0.98] transition-all min-h-[52px] flex items-center justify-center gap-2"
            >
              <span>🎰</span>
              <span>Ir para a Roleta de Prêmios</span>
            </button>
          </div>

        {/* Link para meus cupons */}
        <button
          type="button"
          onClick={() => router.push("/fidelidade/meus-cupons")}
          className="w-full mt-4 py-3 text-sm text-[#e6398f] font-semibold hover:underline"
        >
          Já tenho cupons → Ver meus cupons
        </button>

        {/* Atalhos para Apresentação */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">
            Atalhos para Apresentação
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                handleChange("(31) 99999-0001");
                setTimeout(() => {
                  document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                }, 100);
              }}
              className="px-2 py-2.5 rounded-xl bg-green-50 text-green-600 text-xs font-bold hover:bg-green-100 transition-colors flex flex-col items-center justify-center text-center leading-tight h-14"
            >
              <span>Cliente</span>
              <span>Cadastrado</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleChange(`(31) 90000-${Math.floor(1000 + Math.random() * 9000)}`);
                setTimeout(() => {
                  document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                }, 100);
              }}
              className="px-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors flex flex-col items-center justify-center text-center leading-tight h-14"
            >
              <span>Cliente</span>
              <span>Novo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

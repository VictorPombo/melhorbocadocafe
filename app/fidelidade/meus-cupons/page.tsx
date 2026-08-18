"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Cupom } from "@/lib/fidelidade/types";
import { Gift, ChevronRight, CheckCircle2, Clock, RotateCcw } from "lucide-react";

function MeusCuponsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cupons, setCupons] = useState<Cupom[] | null>(null);
  const [nomeCliente, setNomeCliente] = useState<string>("");

  function formatarTelefone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  async function buscarCuponsZap(zapRaw: string) {
    const cleanWpp = zapRaw.replace(/\D/g, "");
    if (!cleanWpp || cleanWpp.length < 8) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/fidelidade/cupons?whatsapp=${cleanWpp}`);
      const data = await res.json();

      if (data.sucesso) {
        setCupons(data.cupons || []);
        setNomeCliente(data.cliente_nome || "");
        try {
          localStorage.setItem("mb_cliente_whatsapp", cleanWpp);
          const savedPerfil = localStorage.getItem("mb_cliente_perfil");
          const parsed = savedPerfil ? JSON.parse(savedPerfil) : {};
          localStorage.setItem(
            "mb_cliente_perfil",
            JSON.stringify({ ...parsed, whatsapp: cleanWpp, nome: data.cliente_nome || parsed.nome || "Cliente" })
          );
        } catch {}
      } else {
        setCupons([]);
      }
    } catch {
      setCupons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const paramZap = searchParams.get("whatsapp") || searchParams.get("celular") || searchParams.get("wpp");
    if (paramZap) {
      setWhatsapp(formatarTelefone(paramZap));
      buscarCuponsZap(paramZap);
      return;
    }

    try {
      const directZap = localStorage.getItem("mb_cliente_whatsapp");
      if (directZap) {
        setWhatsapp(formatarTelefone(directZap));
        buscarCuponsZap(directZap);
        return;
      }

      const saved = localStorage.getItem("mb_cliente_perfil");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.whatsapp) {
          setWhatsapp(formatarTelefone(parsed.whatsapp));
          buscarCuponsZap(parsed.whatsapp);
        }
      }
    } catch {}
  }, [searchParams]);

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    if (!whatsapp) return;
    buscarCuponsZap(whatsapp);
  }

  // Formulário inicial para informar o WhatsApp
  if (cupons === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-sm mx-auto w-full text-center">
        <div className="w-16 h-16 rounded-3xl bg-pink-100/80 text-[#e6398f] flex items-center justify-center text-3xl shadow-sm mb-4">
          🎁
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-1">
          Consultar Meus Cupons
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          Digite seu WhatsApp para acessar todos os seus prêmios ganhos na Roleta da Sorte.
        </p>

        <form onSubmit={handleBuscar} className="w-full space-y-3">
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatarTelefone(e.target.value))}
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-pink-200 bg-white text-center text-base font-black text-gray-900 focus:border-[#e6398f] outline-none shadow-xs"
            required
            autoFocus
          />

          <button
            type="submit"
            disabled={loading || whatsapp.replace(/\D/g, "").length < 10}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e6398f] to-[#b51e6c] hover:opacity-95 text-white text-xs font-black shadow-md shadow-pink-500/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? "Buscando Cupons..." : "Ver Meus Prêmios"}
          </button>
        </form>

        <button
          onClick={() => router.push("/fidelidade/girar")}
          className="mt-6 text-xs font-black text-[#e6398f] hover:underline"
        >
          ← Ir para a Roleta da Sorte
        </button>
      </div>
    );
  }

  // Se não tem cupons cadastrados para esse número
  if (cupons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-400 flex items-center justify-center text-3xl">
          🎁
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900">Nenhum cupom encontrado</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            O número <strong>{whatsapp}</strong> ainda não possui cupons registrados.
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Ao realizar seu pedido no balcão de qualquer unidade, aponte a câmera para o QR Code da comanda e gire a roleta para concorrer a prêmios!
          </p>
        </div>

        <div className="w-full pt-4 space-y-2">
          <button
            onClick={() => setCupons(null)}
            className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs transition-all cursor-pointer"
          >
            Consultar outro WhatsApp
          </button>
          <button
            onClick={() => router.push("/fidelidade/girar")}
            className="w-full py-3 text-xs font-black text-[#e6398f] hover:underline cursor-pointer"
          >
            ← Ir para a Roleta da Sorte
          </button>
        </div>
      </div>
    );
  }

  // Exibe a lista completa de todos os cupons ganhos
  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            Cupons de {nomeCliente.split(" ")[0] || "Cliente"} 🎁
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {cupons.length} {cupons.length === 1 ? "prêmio registrado" : "prêmios registrados"}
          </p>
        </div>
        <button
          onClick={() => setCupons(null)}
          className="text-xs text-[#e6398f] font-black hover:underline cursor-pointer"
        >
          Trocar telefone
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {cupons.map((c) => {
          const isUsado = c.status === "utilizado";
          const dataUso = c.utilizado_em
            ? new Date(c.utilizado_em).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <button
              key={c.id}
              onClick={() => router.push(`/fidelidade/premio/${c.id}`)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                isUsado
                  ? "bg-gray-50/80 border-gray-200 opacity-60"
                  : "bg-white border-pink-200 shadow-sm hover:border-pink-400 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isUsado ? "bg-gray-200" : "bg-pink-100"
                  }`}
                >
                  {c.premio?.icone || "🎁"}
                </div>
                <div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isUsado ? "text-gray-400" : "text-[#e6398f]"
                    }`}
                  >
                    {c.codigo_cupom}
                  </span>
                  <h3 className="font-extrabold text-sm text-gray-900 leading-tight">
                    {c.premio?.nome}
                  </h3>
                  {isUsado && dataUso ? (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      ✓ Resgatado em {dataUso}
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      ✓ Válido para resgate no balcão
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isUsado
                      ? "bg-gray-200 text-gray-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isUsado ? "Já Utilizado" : "Disponível"}
                </span>
                <p className="text-[10px] text-gray-400 mt-1.5 flex items-center justify-end gap-0.5 font-medium">
                  Ver detalhes →
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100 text-center">
        <button
          onClick={() => router.push("/fidelidade/girar")}
          className="text-xs text-[#e6398f] hover:text-[#b51e6c] font-black cursor-pointer"
        >
          ← Ir para a Roleta da Sorte
        </button>
      </div>
    </div>
  );
}

export default function MeusCuponsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-[#e6398f] border-t-transparent rounded-full" />
        </div>
      }
    >
      <MeusCuponsContent />
    </Suspense>
  );
}

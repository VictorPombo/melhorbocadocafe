"use client";

import React, { useState, useEffect } from "react";
import type { EtapaTrilhaVisita } from "@/lib/fidelidade/types";
import { Sparkles, RotateCcw, Check } from "lucide-react";

interface TrilhaFidelometroProps {
  trilha: EtapaTrilhaVisita[];
  visitaAtual: number; // 1 a N
  identificado?: boolean;
}

export function TrilhaFidelometro({ trilha, visitaAtual, identificado = true }: TrilhaFidelometroProps) {
  const etapasOrdenadas = [...trilha].sort((a, b) => a.visita - b.visita);
  const [etapaSelecionadaNum, setEtapaSelecionadaNum] = useState<number>(visitaAtual || 1);
  const [etapaHoverNum, setEtapaHoverNum] = useState<number | null>(null);

  // Sincroniza a etapa selecionada quando o número da visita do cliente mudar
  useEffect(() => {
    setEtapaSelecionadaNum(visitaAtual || 1);
  }, [visitaAtual]);

  // A etapa exibida no card inferior é o hover (se houver) ou a etapa clicada/selecionada
  const etapaEmVisualizacao =
    etapasOrdenadas.find((e) => e.visita === (etapaHoverNum ?? etapaSelecionadaNum)) ||
    etapasOrdenadas.find((e) => e.visita === visitaAtual) ||
    etapasOrdenadas[0];

  const isVisualizandoHoje = (etapaHoverNum ?? etapaSelecionadaNum) === visitaAtual;
  const isVisualizandoFutura = (etapaHoverNum ?? etapaSelecionadaNum) > visitaAtual;

  const totalEtapas = Math.max(1, etapasOrdenadas.length);
  const progressPct =
    !identificado
      ? 0
      : totalEtapas <= 1
      ? 100
      : Math.min(100, Math.max(0, ((visitaAtual - 1) / (totalEtapas - 1)) * 100));

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-3.5 sm:p-5 border border-pink-100/80 shadow-md space-y-3.5 my-2 transition-all">
      {/* Header Compacto e Refinado */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-gradient-to-r from-pink-50 to-rose-100 text-[#e6398f] rounded-lg text-[11px] font-black tracking-wide border border-pink-200/50">
            📍 Trilha de Fidelidade
          </span>
          <p className="text-xs sm:text-sm font-extrabold text-stone-800">
            {identificado ? (
              <>
                Sua <span className="text-[#e6398f] font-black">{visitaAtual}ª Visita</span>
                <span className="text-stone-400 font-medium ml-1">de {totalEtapas}</span>
              </>
            ) : (
              <span className="text-stone-700 font-extrabold">
                {totalEtapas} Visitas com Recompensas
              </span>
            )}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-50 border border-stone-200/80 text-stone-500 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Passe o mouse ou toque para ver os prêmios</span>
        </div>
      </div>

      {/* Stepper Horizontal com Apenas Números e Tooltips Inteligentes (com padding superior para nunca cortar o balão) */}
      <div className="relative pt-8 pb-2 px-1 sm:px-2 overflow-x-auto overflow-y-visible no-scrollbar touch-pan-x">
        <div className="min-w-[280px] relative">
          {/* Barra de Progresso Traseira */}
          <div className="absolute top-[14px] left-4 right-4 h-1.5 bg-stone-100 rounded-full z-0 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-[#e6398f] to-amber-500 rounded-full transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Nós dos Números */}
          <div className="relative z-10 flex items-center justify-between gap-1 overflow-visible">
          {etapasOrdenadas.map((etapa) => {
            const isPassada = identificado && etapa.visita < visitaAtual;
            const isAtual = identificado && etapa.visita === visitaAtual;
            const isSelected = etapa.visita === etapaSelecionadaNum;
            const isHovered = etapa.visita === etapaHoverNum;

            const premioNomeCurto =
              etapa.modo === "fixo"
                ? etapa.premio_fixo?.nome || etapa.titulo
                : "Roleta da Sorte";

            const premioIcone =
              etapa.modo === "fixo"
                ? etapa.premio_fixo?.icone || "🎁"
                : "🎰";

            return (
              <div
                key={etapa.visita}
                className="relative flex flex-col items-center group"
                onMouseEnter={() => setEtapaHoverNum(etapa.visita)}
                onMouseLeave={() => setEtapaHoverNum(null)}
              >
                {/* TOOLTIP FLUTUANTE NO HOVER (dentro da área com padding) */}
                <div
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 z-30 ${
                    isHovered
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100"
                  }`}
                >
                  <div className="bg-stone-900 text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-xl shadow-xl whitespace-nowrap border border-stone-700 flex items-center gap-1.5">
                    <span>{premioIcone}</span>
                    <span>{etapa.visita}ª: {premioNomeCurto}</span>
                  </div>
                  {/* Setinha apontando para o nó */}
                  <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 mx-auto -mt-1 border-r border-b border-stone-700" />
                </div>

                {/* BOTÃO DO NÚMERO DA VISITA */}
                <button
                  type="button"
                  onClick={() => setEtapaSelecionadaNum(etapa.visita)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200 cursor-pointer focus:outline-none relative ${
                    isAtual
                      ? "bg-gradient-to-tr from-[#e6398f] to-rose-500 text-white ring-4 ring-pink-300/80 ring-offset-2 scale-110 shadow-md shadow-pink-500/30"
                      : isSelected && !isHovered
                      ? "bg-stone-900 text-white ring-3 ring-amber-300 ring-offset-2 scale-105 shadow-md"
                      : isPassada
                      ? "bg-emerald-500 text-white border-2 border-white hover:scale-110 shadow-xs"
                      : "bg-white text-stone-600 border-2 border-stone-200 hover:border-[#e6398f] hover:text-[#e6398f] hover:scale-110 shadow-2xs"
                  }`}
                  title={`Visita ${etapa.visita}: ${premioNomeCurto}`}
                >
                  {/* Apenas o número da visita */}
                  <span>{etapa.visita}</span>

                  {/* Mini indicador de visita concluída */}
                  {isPassada && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-white text-emerald-600 rounded-full flex items-center justify-center text-[8px] font-black shadow-xs">
                      ✓
                    </span>
                  )}
                </button>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Card Dinâmico Compacto e Elegante de Prévia da Recompensa */}
      {etapaEmVisualizacao && (
        <div
          className={`rounded-2xl p-3 sm:p-3.5 border transition-all duration-300 animate-fade-in ${
            isVisualizandoHoje
              ? "bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-amber-50/60 border-pink-200 shadow-2xs"
              : isVisualizandoFutura
              ? "bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70 border-amber-200 shadow-2xs"
              : "bg-stone-50/80 border-stone-200 text-stone-700"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Ícone Redondo */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                  isVisualizandoHoje
                    ? "bg-white border border-pink-200"
                    : isVisualizandoFutura
                    ? "bg-white border border-amber-200"
                    : "bg-white border border-stone-200"
                }`}
              >
                {etapaEmVisualizacao.modo === "fixo"
                  ? etapaEmVisualizacao.premio_fixo?.icone || "🎁"
                  : "🎰"}
              </div>

              {/* Informações da Recompensa */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isVisualizandoHoje
                        ? "text-[#e6398f]"
                        : isVisualizandoFutura
                        ? "text-amber-800"
                        : "text-stone-500"
                    }`}
                  >
                    {isVisualizandoHoje
                      ? `⭐ Recompensa de Hoje • ${etapaEmVisualizacao.visita}ª Visita`
                      : isVisualizandoFutura
                      ? `🎯 Prévia da ${etapaEmVisualizacao.visita}ª Visita (Faltam ${
                          etapaEmVisualizacao.visita - visitaAtual
                        } ${
                          etapaEmVisualizacao.visita - visitaAtual === 1 ? "visita" : "visitas"
                        })`
                      : `✓ Visita Concluída • ${etapaEmVisualizacao.visita}ª Visita`}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-stone-900 leading-tight truncate">
                  {etapaEmVisualizacao.modo === "fixo"
                    ? etapaEmVisualizacao.premio_fixo?.nome || etapaEmVisualizacao.titulo
                    : etapaEmVisualizacao.titulo || "Giro na Roleta da Sorte"}
                </h4>

                <p className="text-[11px] text-stone-600 leading-snug line-clamp-1">
                  {etapaEmVisualizacao.modo === "fixo"
                    ? etapaEmVisualizacao.descricao || "Brinde ou desconto garantido no balcão!"
                    : "Gire a roleta premiada para concorrer a prêmios e delícias!"}
                </p>
              </div>
            </div>

            {/* Ação / Badge da Direita */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`hidden sm:inline-flex px-2.5 py-0.5 text-[11px] font-black rounded-lg border whitespace-nowrap ${
                  isVisualizandoHoje
                    ? "bg-[#e6398f] text-white border-pink-500 shadow-2xs"
                    : isVisualizandoFutura
                    ? "bg-amber-100 text-amber-900 border-amber-200"
                    : "bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                {etapaEmVisualizacao.modo === "fixo" ? "Prêmio Direto" : "Roleta 🎰"}
              </span>

              {!isVisualizandoHoje && (
                <button
                  type="button"
                  onClick={() => {
                    setEtapaHoverNum(null);
                    setEtapaSelecionadaNum(visitaAtual);
                  }}
                  className="px-2 py-1 text-[11px] font-black text-[#e6398f] hover:bg-pink-100/70 rounded-lg flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                  title="Voltar para a visita de hoje"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Voltar para Hoje</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

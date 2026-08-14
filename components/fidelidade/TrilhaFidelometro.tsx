"use client";

import React, { useState, useEffect } from "react";
import type { EtapaTrilhaVisita } from "@/lib/fidelidade/types";
import { Check, Sparkles, Lock, Gift, ArrowRight, RotateCcw } from "lucide-react";

interface TrilhaFidelometroProps {
  trilha: EtapaTrilhaVisita[];
  visitaAtual: number; // 1 a N
}

export function TrilhaFidelometro({ trilha, visitaAtual }: TrilhaFidelometroProps) {
  const etapasOrdenadas = [...trilha].sort((a, b) => a.visita - b.visita);
  const [etapaSelecionadaNum, setEtapaSelecionadaNum] = useState<number>(visitaAtual || 1);

  // Sincroniza a etapa selecionada quando o número da visita do cliente mudar
  useEffect(() => {
    setEtapaSelecionadaNum(visitaAtual || 1);
  }, [visitaAtual]);

  const etapaEmVisualizacao =
    etapasOrdenadas.find((e) => e.visita === etapaSelecionadaNum) ||
    etapasOrdenadas.find((e) => e.visita === visitaAtual) ||
    etapasOrdenadas[0];

  const isVisualizandoHoje = etapaSelecionadaNum === visitaAtual;
  const isVisualizandoFutura = etapaSelecionadaNum > visitaAtual;
  const isVisualizandoPassada = etapaSelecionadaNum < visitaAtual;

  const totalEtapas = Math.max(1, etapasOrdenadas.length);
  const progressPct =
    totalEtapas <= 1 ? 100 : Math.min(100, Math.max(4, ((visitaAtual - 1) / (totalEtapas - 1)) * 100));

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-6 border border-pink-100 shadow-sm space-y-4 my-2 transition-all">
      {/* Header do Fidelômetro — Sem quebras feias de linha */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap pb-1 border-b border-gray-100/80">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-[#e6398f] rounded-xl text-xs font-black whitespace-nowrap shadow-2xs">
            📍 Trilha de Fidelidade
          </span>
          <p className="text-xs sm:text-sm font-extrabold text-gray-800 whitespace-nowrap">
            Sua <span className="text-[#e6398f] font-black">{visitaAtual}ª Visita</span>
            <span className="text-gray-400 font-bold ml-1">de {totalEtapas}</span>
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200 text-stone-600 text-[11px] font-bold whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Toque nas etapas para ver os prêmios</span>
        </div>
      </div>

      {/* Linha do Tempo Horizontal / Nós Clicáveis das Visitas */}
      <div className="relative py-2 px-1">
        {/* Barra de Progresso Traseira com gradiente vivo */}
        <div className="absolute top-[22px] left-4 right-4 h-2 bg-stone-100 rounded-full z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#e6398f] to-amber-500 rounded-full transition-all duration-700 shadow-xs"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Nós Interativos */}
        <div className="relative z-10 flex items-center justify-between gap-1 overflow-x-auto py-1 px-1 scrollbar-none">
          {etapasOrdenadas.map((etapa) => {
            const isPassada = etapa.visita < visitaAtual;
            const isAtual = etapa.visita === visitaAtual;
            const isSelected = etapa.visita === etapaSelecionadaNum;

            return (
              <button
                key={etapa.visita}
                type="button"
                onClick={() => setEtapaSelecionadaNum(etapa.visita)}
                className="flex flex-col items-center min-w-[32px] sm:min-w-[40px] group cursor-pointer focus:outline-none transition-transform active:scale-95"
                title={`Ver prêmio da ${etapa.visita}ª Visita`}
              >
                {/* Círculo do Nó */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-sm ${
                    isSelected && !isAtual
                      ? "bg-stone-900 text-white ring-4 ring-amber-300 ring-offset-2 scale-110 shadow-md"
                      : isAtual
                      ? "bg-gradient-to-tr from-[#e6398f] to-rose-500 text-white ring-4 ring-pink-300 ring-offset-2 scale-110 shadow-lg shadow-pink-500/40"
                      : isPassada
                      ? "bg-emerald-500 text-white border-2 border-white hover:scale-105"
                      : "bg-white text-gray-500 border-2 border-gray-200 hover:border-[#e6398f] hover:text-[#e6398f]"
                  }`}
                >
                  {isPassada ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isAtual ? (
                    <span className="text-sm font-black">{etapa.visita}</span>
                  ) : etapa.modo === "fixo" ? (
                    <span className="text-xs sm:text-sm">{etapa.premio_fixo?.icone || "🎁"}</span>
                  ) : (
                    <span className="text-xs sm:text-sm">🎰</span>
                  )}
                </div>

                {/* Rótulo da Visita */}
                <span
                  className={`text-[10px] mt-1.5 font-bold tracking-tight whitespace-nowrap transition-colors ${
                    isSelected
                      ? "text-stone-900 font-black scale-105"
                      : isAtual
                      ? "text-[#e6398f] font-black"
                      : isPassada
                      ? "text-emerald-700 font-extrabold"
                      : "text-gray-400 group-hover:text-gray-700"
                  }`}
                >
                  {etapa.visita}ª
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Dinâmico de Detalhes da Recompensa Selecionada */}
      {etapaEmVisualizacao && (
        <div
          className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
            isVisualizandoHoje
              ? "bg-gradient-to-r from-pink-50/80 via-rose-50/60 to-amber-50/70 border-pink-200 shadow-sm"
              : isVisualizandoFutura
              ? "bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border-amber-200 shadow-sm"
              : "bg-gray-50/90 border-gray-200 text-gray-700"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Ícone Grande */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                  isVisualizandoHoje
                    ? "bg-white border border-pink-200 text-[#e6398f]"
                    : isVisualizandoFutura
                    ? "bg-white border border-amber-200"
                    : "bg-white border border-gray-200"
                }`}
              >
                {etapaEmVisualizacao.modo === "fixo"
                  ? etapaEmVisualizacao.premio_fixo?.icone || "🎁"
                  : "🎰"}
              </div>

              {/* Textos Informativos */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                      isVisualizandoHoje
                        ? "text-[#e6398f]"
                        : isVisualizandoFutura
                        ? "text-amber-800"
                        : "text-gray-500"
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

                <h4 className="text-sm sm:text-base font-black text-gray-900 leading-tight truncate">
                  {etapaEmVisualizacao.modo === "fixo"
                    ? `Prêmio Fixo: ${etapaEmVisualizacao.premio_fixo?.nome || etapaEmVisualizacao.titulo}`
                    : etapaEmVisualizacao.titulo || "Giro na Roleta da Sorte"}
                </h4>

                <p className="text-xs text-gray-600 leading-snug">
                  {etapaEmVisualizacao.modo === "fixo"
                    ? etapaEmVisualizacao.descricao ||
                      (etapaEmVisualizacao.premio_fixo?.tipo === "desconto"
                        ? `Ganhe ${etapaEmVisualizacao.premio_fixo.valor}% de desconto no seu pedido!`
                        : etapaEmVisualizacao.premio_fixo?.tipo === "desconto_reais"
                        ? `Ganhe R$ ${etapaEmVisualizacao.premio_fixo.valor?.toFixed(2)} OFF no seu pedido!`
                        : "Brinde especial entregue diretamente no caixa!")
                    : etapaEmVisualizacao.premios_roleta && etapaEmVisualizacao.premios_roleta.length > 0
                    ? `Roleta exclusiva com ${etapaEmVisualizacao.premios_roleta.length} prêmios e descontos especiais!`
                    : "Gire a roleta premiada para concorrer a donuts e descontos!"}
                </p>
              </div>
            </div>

            {/* Badges e Ações na Direita */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200/50">
              <span
                className={`px-3 py-1 text-xs font-black rounded-xl shadow-xs border whitespace-nowrap ${
                  isVisualizandoHoje
                    ? "bg-[#e6398f] text-white border-pink-500"
                    : isVisualizandoFutura
                    ? "bg-amber-100 text-amber-900 border-amber-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {etapaEmVisualizacao.modo === "fixo" ? "Prêmio Direto" : "Roleta 🎰"}
              </span>

              {!isVisualizandoHoje && (
                <button
                  type="button"
                  onClick={() => setEtapaSelecionadaNum(visitaAtual)}
                  className="px-2.5 py-1 text-xs font-black text-[#e6398f] hover:bg-pink-100/60 rounded-lg flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Voltar para Hoje</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

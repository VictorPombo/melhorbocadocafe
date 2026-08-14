"use client";

import React, { useState, useEffect } from "react";
import type { EtapaTrilhaVisita } from "@/lib/fidelidade/types";
import { Check, Sparkles, Lock, Gift, ArrowRight, RotateCcw } from "lucide-react";

interface TrilhaFidelometroProps {
  trilha: EtapaTrilhaVisita[];
  visitaAtual: number; // 1 a 10
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
  const progressPct = totalEtapas <= 1 ? 100 : Math.min(100, Math.max(6, ((visitaAtual - 1) / (totalEtapas - 1)) * 100));

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-5 border border-pink-100/90 shadow-md space-y-4 my-2 transition-all">
      {/* Header do Card */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-pink-100 text-[#e6398f] rounded-xl text-xs font-black">
            📍 Trilha de Fidelidade
          </span>
          <p className="text-xs font-bold text-gray-900">
            Sua <strong className="text-[#e6398f] font-black">{visitaAtual}ª Visita</strong>
            <span className="text-gray-400 font-normal ml-1">de {totalEtapas}</span>
          </p>
        </div>

        <span className="text-[10px] text-pink-600/80 font-bold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100 flex items-center gap-1">
          <span>👆 Toque para ver os prêmios</span>
        </span>
      </div>

      {/* Linha do Tempo Horizontal / Botões Clicáveis das Etapas */}
      <div className="relative">
        {/* Barra de Progresso Traseira */}
        <div className="absolute top-4 left-3 right-3 h-1.5 bg-gray-100 rounded-full z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#e6398f] to-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Nós Interativos das 10 Visitas */}
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
                className="flex flex-col items-center min-w-[32px] sm:min-w-[36px] group cursor-pointer focus:outline-none transition-transform active:scale-90"
                title={`Clique para ver a recompensa da ${etapa.visita}ª Visita`}
              >
                {/* Círculo do Nó */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-sm ${
                    isSelected && !isAtual
                      ? "bg-stone-900 text-white ring-4 ring-amber-300 ring-offset-1 scale-115 shadow-md"
                      : isAtual
                      ? "bg-[#e6398f] text-white ring-4 ring-pink-300 ring-offset-1 scale-110 shadow-pink-500/40"
                      : isPassada
                      ? "bg-emerald-500 text-white border-2 border-white hover:scale-105"
                      : "bg-gray-100 text-gray-500 border-2 border-white hover:bg-pink-50 hover:text-[#e6398f]"
                  }`}
                >
                  {isPassada ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isAtual ? (
                    <span>{etapa.visita}</span>
                  ) : etapa.modo === "fixo" ? (
                    <span className="text-[11px]">{etapa.premio_fixo?.icone || "🎁"}</span>
                  ) : (
                    <span className="text-[11px]">🎰</span>
                  )}
                </div>

                {/* Rótulo da Visita */}
                <span
                  className={`text-[9px] mt-1 font-bold tracking-tight whitespace-nowrap transition-colors ${
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

      {/* Card Dinâmico de Detalhes da Recompensa da Etapa Clicada */}
      {etapaEmVisualizacao && (
        <div
          className={`rounded-2xl p-3.5 border transition-all duration-300 ${
            isVisualizandoHoje
              ? "bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border-pink-200 shadow-sm"
              : isVisualizandoFutura
              ? "bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-amber-50/70 border-amber-200/90 shadow-sm"
              : "bg-gray-50 border-gray-200 text-gray-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Ícone Grande da Recompensa */}
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm ${
                  isVisualizandoHoje
                    ? "bg-white border border-pink-100"
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
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
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

                <p className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                  {etapaEmVisualizacao.modo === "fixo"
                    ? `Prêmio Fixo: ${etapaEmVisualizacao.premio_fixo?.nome || etapaEmVisualizacao.titulo}`
                    : etapaEmVisualizacao.titulo || "Giro na Roleta da Sorte"}
                </p>

                <p className="text-[11px] text-gray-600 leading-snug">
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

                {/* Exibição das Fatias se for Roleta e tiver prêmios customizados */}
                {etapaEmVisualizacao.modo === "roleta" &&
                  etapaEmVisualizacao.premios_roleta &&
                  etapaEmVisualizacao.premios_roleta.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {etapaEmVisualizacao.premios_roleta.slice(0, 4).map((p, pIdx) => (
                        <span
                          key={p.id || pIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/90 border border-amber-200 text-gray-800 shadow-2xs"
                        >
                          <span>{p.icone || "🎁"}</span>
                          <span className="truncate max-w-[80px]">{p.nome}</span>
                        </span>
                      ))}
                      {etapaEmVisualizacao.premios_roleta.length > 4 && (
                        <span className="text-[9px] font-black text-amber-700 self-center">
                          +{etapaEmVisualizacao.premios_roleta.length - 4} outros
                        </span>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Badge de Modalidade / Botão de Voltar para Hoje */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span
                className={`px-2.5 py-1 text-[10px] font-black rounded-lg shadow-xs border ${
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
                  className="text-[10px] font-black text-[#e6398f] hover:underline flex items-center gap-0.5 cursor-pointer mt-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Ver Hoje</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

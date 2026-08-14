"use client";

import React from "react";
import type { Premio } from "@/lib/fidelidade/types";

interface RoletaMiniProps {
  premios: Premio[];
  className?: string;
}

const CORES_FATIAS = [
  "#e6398f", // Glaze Pink
  "#4a2810", // Chocolate Belga
  "#d97706", // Caramelo Dourado
  "#7c3aed", // Berry Violet
  "#059669", // Pistache Nobre
  "#2563eb", // Vanilla Blue
  "#e11d48", // Red Velvet
  "#db2777", // Morango Silvestre
  "#b45309", // Doce de Leite
  "#475569", // Prata
  "#0d9488", // Menta
  "#ea580c", // Tangerina
];

export function RoletaMini({ premios, className = "" }: RoletaMiniProps) {
  const listaPremios = Array.isArray(premios) && premios.length > 0 ? premios : [];
  const numFatias = Math.max(2, listaPremios.length);
  const anguloPorFatia = 360 / numFatias;

  const fatias = listaPremios.map((p, idx) => ({
    posicao: p.posicao_roleta || idx + 1,
    nome: p.nome || `Prêmio ${idx + 1}`,
    cor: p.cor_fatia || CORES_FATIAS[idx % CORES_FATIAS.length],
    icone: p.icone || "🎁",
    valor: p.valor || 0,
    tipo: p.tipo || "produto",
  }));

  // LEDs ao redor
  const leds = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 360) / 12;
    const rad = (angle * Math.PI) / 180;
    const r = 94;
    const x = 100 + r * Math.cos(rad);
    const y = 100 + r * Math.sin(rad);
    return { x, y };
  });

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Seta Dourada no Topo (Dentro do enquadramento) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center filter drop-shadow-md pointer-events-none">
        <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-100 via-amber-400 to-amber-600 border border-white shadow-xs" />
        <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[12px] border-t-amber-400 -mt-1" />
      </div>

      {/* SVG da Roleta Completa com Moldura e Fatias */}
      <div className="w-full h-full pt-2">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-lg"
          suppressHydrationWarning
        >
          <defs>
            <radialGradient id="miniBordaOuro" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#4a2810" />
              <stop offset="90%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <radialGradient id="miniCentroGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e6398f" />
              <stop offset="100%" stopColor="#831843" />
            </radialGradient>
            <filter id="miniShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0.5" stdDeviation="0.4" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Moldura Externa */}
          <circle cx="100" cy="100" r="99" fill="url(#miniBordaOuro)" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="100" cy="100" r="91" fill="#1c1917" />

          {/* LEDs na moldura */}
          {leds.map((led, i) => (
            <circle
              key={i}
              cx={led.x}
              cy={led.y}
              r="2.2"
              fill={i % 2 === 0 ? "#fef08a" : "#ffffff"}
              stroke="#ca8a04"
              strokeWidth="0.5"
            />
          ))}

          {/* Grupo das Fatias (com rotação inicial -90 para o topo) */}
          <g transform="rotate(-90 100 100)">
            {fatias.map((fatia, i) => {
              const startAngle = i * anguloPorFatia;
              const endAngle = (i + 1) * anguloPorFatia;
              const radStart = (Math.PI * startAngle) / 180;
              const radEnd = (Math.PI * endAngle) / 180;

              const rFatia = 88;
              const x1 = 100 + rFatia * Math.cos(radStart);
              const y1 = 100 + rFatia * Math.sin(radStart);
              const x2 = 100 + rFatia * Math.cos(radEnd);
              const y2 = 100 + rFatia * Math.sin(radEnd);

              const pathData = `M 100 100 L ${x1} ${y1} A ${rFatia} ${rFatia} 0 0 1 ${x2} ${y2} Z`;
              const midAngle = startAngle + anguloPorFatia / 2;

              let texto = "";
              if (fatia.tipo === "desconto") {
                texto = `${fatia.valor}% OFF`;
              } else if (fatia.tipo === "desconto_reais") {
                texto = `R$ ${fatia.valor}`;
              } else {
                const palavras = fatia.nome.split(" ");
                texto = palavras[0];
              }

              return (
                <g key={i}>
                  <path
                    d={pathData}
                    fill={fatia.cor}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />
                  {/* Conteúdo da Fatia */}
                  <g transform={`rotate(${midAngle} 100 100)`}>
                    {/* Ícone */}
                    <text
                      x="164"
                      y="102"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="10"
                      transform="rotate(90 164 102)"
                    >
                      {fatia.icone}
                    </text>
                    {/* Texto */}
                    <text
                      x="138"
                      y="101"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="5.8"
                      fontWeight="900"
                      fill="#ffffff"
                      filter="url(#miniShadow)"
                      transform="rotate(90 138 101)"
                      letterSpacing="-0.2"
                    >
                      {texto}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Centro da Roleta (Pin central dourado com logo) */}
          <circle cx="100" cy="100" r="28" fill="#d97706" stroke="#fef08a" strokeWidth="2" />
          <circle cx="100" cy="100" r="24" fill="url(#miniCentroGrad)" stroke="#ffffff" strokeWidth="1.2" />
          <text
            x="100"
            y="96"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="4.8"
            fontWeight="900"
            fill="#ffffff"
            letterSpacing="0.4"
          >
            MELHOR
          </text>
          <text
            x="100"
            y="103"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="4.8"
            fontWeight="900"
            fill="#fef08a"
            letterSpacing="0.4"
          >
            BOCADO
          </text>
        </svg>
      </div>
    </div>
  );
}

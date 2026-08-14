"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { Premio } from "@/lib/fidelidade/types";

interface RoletaProps {
  premios: Premio[];
  posicaoSorteada: number | null; // 1 a 10
  girando: boolean;
  onAnimacaoConcluida?: () => void;
}

export function Roleta({
  premios,
  posicaoSorteada,
  girando,
  onAnimacaoConcluida,
}: RoletaProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const currentRotation = useRef<number>(0);
  const [ledActive, setLedActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const listaPremios = Array.isArray(premios) && premios.length > 0 ? premios : [];
  const numFatias = Math.max(2, listaPremios.length);
  const anguloPorFatia = 360 / numFatias;

  // Paleta premium de confeitaria (alto contraste, vibrante e sofisticada)
  const CORES_FATIAS = [
    "#e6398f", // 1. Glaze Pink
    "#4a2810", // 2. Chocolate Belga Intenso
    "#d97706", // 3. Caramelo Dourado
    "#7c3aed", // 4. Berry Violet
    "#059669", // 5. Pistache Nobre
    "#2563eb", // 6. Vanilla Blue
    "#e11d48", // 7. Red Velvet
    "#db2777", // 8. Morango Silvestre
    "#b45309", // 9. Doce de Leite Artesanal
    "#475569", // 10. Tente Novamente
    "#0d9488", // 11. Menta Refrescante
    "#ea580c", // 12. Tangerina Citrus
  ];

  const fatiasOrdenadas = listaPremios.map((p, idx) => {
    const pos = p.posicao_roleta || idx + 1;
    return {
      posicao: pos,
      nome: p.nome || `Prêmio ${pos}`,
      cor: p.cor_fatia || CORES_FATIAS[idx % CORES_FATIAS.length],
      icone: p.icone || "🍩",
      valor: p.valor || 0,
      tipo: p.tipo || "produto",
    };
  });
  const initAudio = useCallback(() => {
    if (typeof window !== "undefined" && !audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  // Tique mecânico de catraca da roleta
  const playTickSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignora falha de áudio
    }
  }, []);

  // Fanfarra / Som de vitória quando a roleta para
  const playWinSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const notas = [523.25, 659.25, 783.99, 1046.5]; // Dó, Mi, Sol, Dó agudo

      notas.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.3, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch {
      // Ignora
    }
  }, []);

  const onAnimacaoConcluidaRef = useRef(onAnimacaoConcluida);
  useEffect(() => {
    onAnimacaoConcluidaRef.current = onAnimacaoConcluida;
  }, [onAnimacaoConcluida]);

  // Animação dos LEDs piscantes na moldura externa
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (girando) {
      interval = setInterval(() => {
        setLedActive((prev) => !prev);
      }, 120);
    } else {
      setLedActive(false);
    }
    return () => clearInterval(interval);
  }, [girando]);

  // Efeito principal de giro e reprodução de som sincronizada
  useEffect(() => {
    if (girando && posicaoSorteada !== null && wheelRef.current) {
      try {
        initAudio();
      } catch {}

      // Cálculo exato para que o centro da fatia sorteada pare sob o ponteiro (0° no topo)
      const voltasCompletas = 6 * 360;
      // Fatia N fica centralizada no ângulo (N - 1) * 36 + 18
      const anguloCentroFatia = (posicaoSorteada - 1) * anguloPorFatia + anguloPorFatia / 2;
      // Para alinhar ao topo (0°):
      const anguloDestino = voltasCompletas + (360 - anguloCentroFatia);

      currentRotation.current += anguloDestino;
      
      const wheelEl = wheelRef.current;
      requestAnimationFrame(() => {
        if (wheelEl) {
          wheelEl.style.transition = "transform 4s cubic-bezier(0.12, 0.98, 0.22, 1)";
          wheelEl.style.transform = `rotate(${currentRotation.current}deg)`;
        }
      });

      // Simula os tiques de catraca desacelerando
      const totalDuracao = 4000;
      let elapsed = 0;
      let intervalMs = 60;
      const tickTimers: NodeJS.Timeout[] = [];

      const scheduleTick = () => {
        if (elapsed >= totalDuracao - 400) return;
        try {
          playTickSound();
        } catch {}
        if (typeof window !== "undefined" && navigator.vibrate && elapsed < 2000) {
          try { navigator.vibrate(15); } catch {}
        }
        elapsed += intervalMs;
        // Curva de desaceleração dos cliques
        intervalMs = Math.floor(intervalMs * 1.07);
        const t = setTimeout(scheduleTick, intervalMs);
        tickTimers.push(t);
      };

      const startTimeout = setTimeout(scheduleTick, 50);

      // Conclusão do giro
      const finishTimeout = setTimeout(() => {
        try {
          playWinSound();
        } catch {}
        if (typeof window !== "undefined" && navigator.vibrate) {
          try { navigator.vibrate([100, 60, 200]); } catch {}
        }
        if (onAnimacaoConcluidaRef.current) {
          onAnimacaoConcluidaRef.current();
        }
      }, totalDuracao);

      return () => {
        clearTimeout(startTimeout);
        clearTimeout(finishTimeout);
        tickTimers.forEach(clearTimeout);
      };
    }
  }, [girando, posicaoSorteada, anguloPorFatia, initAudio, playTickSound, playWinSound]);


  // 16 LEDs perfeitamente distribuídos na borda externa
  const leds = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16;
    const rad = (angle * Math.PI) / 180;
    const radiusPct = 47.8;
    const x = (50 + radiusPct * Math.cos(rad)).toFixed(4);
    const y = (50 + radiusPct * Math.sin(rad)).toFixed(4);
    return { x, y, angle };
  });

  return (
    <div className="relative w-80 h-80 sm:w-[380px] sm:h-[380px] mx-auto my-3 select-none drop-shadow-2xl">
      {/* Moldura Externa de Ouro & Chocolate da Doceria */}
      <div className="absolute -inset-3.5 rounded-full bg-gradient-to-tr from-[#3a1a08] via-[#78350f] via-[#e6398f] to-[#fbbf24] p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        {/* Luzes LED Animadas na Moldura */}
        <div className="relative w-full h-full rounded-full border-2 border-amber-300/60" suppressHydrationWarning>
          {leds.map((led, idx) => (
            <div
              key={idx}
              className={`absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 border border-white transition-all duration-150 ${
                (idx % 2 === 0 ? ledActive : !ledActive)
                  ? "bg-amber-300 shadow-[0_0_12px_#fde047] scale-110"
                  : "bg-amber-100/50 shadow-inner scale-90"
              }`}
              style={{ left: `${led.x}%`, top: `${led.y}%` }}
              suppressHydrationWarning
            />
          ))}
        </div>
      </div>

      {/* Ponteiro / Seta Dourada de Alta Precisão no Topo */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] pointer-events-none">
        <div className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-100 via-amber-400 to-amber-600 border-2 border-amber-50 shadow-md flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-950" />
        </div>
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 -mt-1.5" />
      </div>

      {/* Disco Giratório da Roleta (viewBox 0 0 200 200 com renderização nítida) */}
      <div
        ref={wheelRef}
        className="w-full h-full rounded-full shadow-inner overflow-hidden border-[5px] border-amber-200 relative bg-amber-950"
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform -rotate-90"
          suppressHydrationWarning
        >
          <defs>
            {/* Sombra de alta nitidez para os textos e ícones */}
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0.6" stdDeviation="0.4" floodColor="#000000" floodOpacity="0.9" />
            </filter>
          </defs>

          {fatiasOrdenadas.map((fatia, i) => {
            const startAngle = i * anguloPorFatia;
            const endAngle = (i + 1) * anguloPorFatia;
            const radStart = (Math.PI * startAngle) / 180;
            const radEnd = (Math.PI * endAngle) / 180;

            const x1 = (100 + 100 * Math.cos(radStart)).toFixed(4);
            const y1 = (100 + 100 * Math.sin(radStart)).toFixed(4);
            const x2 = (100 + 100 * Math.cos(radEnd)).toFixed(4);
            const y2 = (100 + 100 * Math.sin(radEnd)).toFixed(4);

            const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;
            const midAngle = startAngle + anguloPorFatia / 2;

            // Formatação inteligente e ultra-adaptativa em 2 linhas
            let linha1 = "";
            let linha2 = "";
            let tamanhoFonte = 5.2;

            if (fatia.tipo === "desconto") {
              linha1 = `${fatia.valor || 10}%`;
              linha2 = "OFF";
              tamanhoFonte = 6.2;
            } else if (fatia.tipo === "desconto_reais") {
              linha1 = `R$ ${fatia.valor || 5}`;
              linha2 = "OFF";
              tamanhoFonte = 5.4;
            } else {
              const nomeLimpo = fatia.nome.trim();
              const palavras = nomeLimpo.split(" ").filter(Boolean);

              if (palavras.length === 1) {
                linha1 = palavras[0];
                tamanhoFonte = linha1.length > 8 ? 4.4 : 5.4;
              } else if (palavras.length === 2) {
                linha1 = palavras[0];
                linha2 = palavras[1];
                tamanhoFonte = Math.max(linha1.length, linha2.length) > 8 ? 4.5 : 5.2;
              } else {
                // 3 ou mais palavras (ex: Donut Chocolate Belga -> Donut / Belga)
                linha1 = palavras[0];
                linha2 = palavras.slice(1).join(" ");
                if (linha2.length > 9) {
                  linha2 = palavras[palavras.length - 1]; // pega a última palavra principal
                }
                tamanhoFonte = 4.6;
              }
            }

            return (
              <g key={fatia.posicao} suppressHydrationWarning>
                {/* Fatia da Roleta */}
                <path
                  d={pathData}
                  fill={fatia.cor}
                  stroke="#ffffff"
                  strokeWidth="1"
                  suppressHydrationWarning
                />

                {/* Divisória Dourada */}
                <line
                  x1="100"
                  y1="100"
                  x2={x1}
                  y2={y1}
                  stroke="#fde047"
                  strokeWidth="0.8"
                  opacity="0.7"
                  suppressHydrationWarning
                />

                {/* Grupo de Texto e Ícone Centralizados na Pista Segura da Fatia */}
                <g
                  transform={`rotate(${midAngle} 100 100)`}
                  suppressHydrationWarning
                >
                  {/* Ícone / Emoji na borda externa (r=86) */}
                  <text
                    x="185"
                    y="100"
                    fill="#ffffff"
                    fontSize="8.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    filter="url(#textShadow)"
                    suppressHydrationWarning
                  >
                    {fatia.icone}
                  </text>

                  {/* Linha 1 do Prêmio (Centralizado em x=156, y=96.5) */}
                  <text
                    x="156"
                    y={linha2 ? 96.5 : 100}
                    fill="#ffffff"
                    fontSize={tamanhoFonte}
                    fontWeight="900"
                    letterSpacing="0.02em"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="central"
                    filter="url(#textShadow)"
                    stroke="#000000"
                    strokeWidth="0.25"
                    paintOrder="stroke fill"
                    suppressHydrationWarning
                  >
                    {linha1}
                  </text>

                  {/* Linha 2 do Prêmio (se houver, y=103.5) */}
                  {linha2 && (
                    <text
                      x="156"
                      y={103.5}
                      fill={fatia.tipo === "desconto" ? "#fde047" : "#ffffff"}
                      fontSize={tamanhoFonte * 0.95}
                      fontWeight="900"
                      letterSpacing="0.02em"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                      filter="url(#textShadow)"
                      stroke="#000000"
                      strokeWidth="0.25"
                      paintOrder="stroke fill"
                      suppressHydrationWarning
                    >
                      {linha2}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Centro: Donut Dourado "Melhor Bocado" Perfeitamente Proporcionado */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-b from-amber-200 via-amber-500 to-amber-800 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/90 bg-stone-950 flex items-center justify-center">
          <Image
            src="/images/donut_roleta_center.png"
            alt="Donut Melhor Bocado"
            fill
            sizes="(max-width: 768px) 96px, 112px"
            className="object-cover scale-110"
            priority
          />
          <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center text-center p-1 backdrop-blur-[0.5px]">
            <span className="text-[8px] sm:text-[9px] font-black text-white tracking-wider uppercase bg-[#e6398f]/95 px-1.5 py-0.5 rounded-full border border-pink-300 shadow-sm">
              MELHOR BOCADO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


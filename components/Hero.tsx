"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LOJA } from "@/lib/config";
import { IFoodIcon, WhatsAppIcon } from "@/components/Icons";

function useStoreStatus() {
  const [status, setStatus] = useState({ aberto: false, texto: "" });

  useEffect(() => {
    function check() {
      const now = new Date();
      const hora = now.getHours();
      const dia = now.getDay(); // 0 = domingo

      if (dia === 0) {
        // Domingo
        const aberto = hora >= LOJA.horario.abreDom && hora < LOJA.horario.fechaDom;
        setStatus({
          aberto,
          texto: aberto
            ? `Aberto · Fecha às ${LOJA.horario.fechaDom}h`
            : `Fechado · Abre dom. às ${LOJA.horario.abreDom}h`,
        });
      } else {
        // Seg-Sáb
        const aberto = hora >= LOJA.horario.abreSegSab && hora < LOJA.horario.fechaSegSab;
        setStatus({
          aberto,
          texto: aberto
            ? `Aberto · Fecha às ${LOJA.horario.fechaSegSab}h`
            : `Fechado · Abre às ${LOJA.horario.abreSegSab}h`,
        });
      }
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  return status;
}

export default function Hero() {
  const { aberto, texto } = useStoreStatus();

  return (
    <section
      id="inicio"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <Image
        src="/donuts-hero.jpg"
        alt="Donuts americanos artesanais da Melhor Bocado Café"
        fill
        className="object-cover"
        priority
        quality={90}
      />

      {/* Gradient overlay — heavy for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-[-80px] w-64 h-64 bg-rosa-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-20 right-[-60px] w-72 h-72 bg-roxo-600/20 rounded-full blur-3xl animate-blob delay-300" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-5 sm:px-6 max-w-3xl mx-auto py-24 md:py-0">
        {/* Status badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium mb-10 sm:mb-12">
          <span
            className={`w-2 h-2 rounded-full ${
              aberto ? "bg-green-400 animate-pulse" : "bg-red-400"
            }`}
          />
          {texto || `${LOJA.bairro}, São Paulo`}
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up delay-100 font-fredoka text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] mb-5 sm:mb-6 drop-shadow-2xl">
          Donuts Americanos{" "}
          <span className="text-rosa-300">Artesanais</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-200 text-base sm:text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed px-2">
          {LOJA.subtitulo}
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-10 sm:mb-12">
          <a
            href={LOJA.links.ifood}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rosa-500 to-magenta-600 text-white font-bold text-base sm:text-lg shadow-2xl shadow-rosa-500/30 hover:shadow-rosa-500/50 hover:scale-105 active:scale-95 transition-all"
          >
            <IFoodIcon className="h-7 shrink-0" />
            Pedir no iFood
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href={LOJA.links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-base sm:text-lg hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
          >
            <WhatsAppIcon className="w-5 h-5 shrink-0" />
            Fale no WhatsApp
          </a>
        </div>

        {/* Social strip */}
        <div className="animate-fade-in-up delay-400 flex justify-center gap-3 sm:gap-4">
          {[
            { href: LOJA.links.instagram, label: "Instagram", icon: (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            )},
            { href: LOJA.links.tiktok, label: "TikTok", icon: (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.12V9.04a6.35 6.35 0 00-.82-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.33 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.77 1.52V7.12a4.83 4.83 0 01-1-.43z"/></svg>
            )},
            { href: LOJA.links.google, label: "Avaliações Google", icon: (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
            )},
          ].map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

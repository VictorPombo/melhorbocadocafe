"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CARDAPIO, TOTAL_PRODUTOS } from "@/lib/cardapio";
import { LOJA } from "@/lib/config";
import { IFoodIcon } from "@/components/Icons";

/** Ícones por categoria */
const categoryIcons: Record<string, React.ReactNode> = {
  donuts: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={2} /><circle cx="12" cy="12" r="3" strokeWidth={2} /></svg>
  ),
  rings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={2} /><circle cx="12" cy="12" r="4" strokeWidth={2} /></svg>
  ),
  "donuts-bombom": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8l-2 4h4l-2 4" /><circle cx="12" cy="12" r="9" strokeWidth={2} /></svg>
  ),
  "mini-donuts": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="8" cy="12" r="5" strokeWidth={2} /><circle cx="16" cy="12" r="5" strokeWidth={2} /></svg>
  ),
  cakes: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0H3m6-8v3m3-3v3m3-3v3" /></svg>
  ),
  muffins: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-4 0-7 3-7 5h14c0-2-3-5-7-5zM5 8v2a2 2 0 002 2h10a2 2 0 002-2V8M7 12v7a2 2 0 002 2h6a2 2 0 002-2v-7" /></svg>
  ),
  paes: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16s1-4 8-4 8 4 8 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
  ),
  sobremesas: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
  ),
  caixas: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  ),
};

export default function CardapioPage() {
  const [activeCategory, setActiveCategory] = useState(CARDAPIO[0].slug);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("cat-", ""));
          }
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  function scrollToCategory(slug: string) {
    const el = sectionRefs.current[slug];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveCategory(slug);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero compacto */}
      <section className="relative gradient-brand pt-28 pb-16 px-5 sm:px-6 text-center text-white overflow-hidden">
        <div className="absolute top-10 left-[-60px] w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-[-40px] w-56 h-56 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao início
          </Link>
          <h1 className="font-fredoka text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Nosso Cardápio
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-lg mx-auto mb-3">
            {LOJA.descricao}
          </p>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium">
            {TOTAL_PRODUTOS} produtos · {CARDAPIO.length} categorias
          </span>
        </div>
      </section>

      {/* Category tabs — sticky */}
      <div
        ref={tabsRef}
        className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4 sm:-mx-0 sm:px-0">
            {CARDAPIO.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => scrollToCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.slug
                    ? "bg-gradient-to-r from-rosa-500 to-magenta-600 text-white shadow-lg shadow-rosa-500/20"
                    : "text-gray-500 hover:text-rosa-600 hover:bg-rosa-50"
                }`}
              >
                {categoryIcons[cat.slug]}
                {cat.nome}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.slug
                    ? "bg-white/20"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {cat.produtos.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product sections */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-16 space-y-16 sm:space-y-20">
        {CARDAPIO.map((cat) => (
          <div
            key={cat.slug}
            id={`cat-${cat.slug}`}
            ref={(el) => { sectionRefs.current[cat.slug] = el; }}
            className="scroll-mt-32"
          >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rosa-500 to-magenta-600 flex items-center justify-center text-white shadow-lg shadow-rosa-500/15">
                {categoryIcons[cat.slug]}
              </div>
              <div>
                <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {cat.nome}
                  {cat.slug === "donuts-bombom" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-rosa-500 to-magenta-600 text-white">
                      Lançamento
                    </span>
                  )}
                </h2>
                <p className="text-gray-400 text-sm">{cat.produtos.length} itens</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-6 ml-[52px]">{cat.descricao}</p>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {cat.produtos.map((produto) => (
                <div
                  key={produto.nome}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rosa-50/50 to-white border border-rosa-100/40 hover:border-rosa-200 hover:shadow-lg hover:shadow-rosa-500/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {produto.destaque && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r from-rosa-500 to-magenta-600 animate-pulse" />
                  )}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rosa-100 to-magenta-100 flex items-center justify-center mb-3 group-hover:from-rosa-200 group-hover:to-magenta-200 transition-colors">
                    <div className="text-rosa-500 opacity-60">
                      {categoryIcons[cat.slug]}
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 leading-snug">
                    {produto.nome}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <a
          href={LOJA.links.ifood}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rosa-500 to-magenta-600 text-white font-bold text-sm sm:text-base shadow-2xl shadow-rosa-500/40 hover:shadow-rosa-500/60 hover:scale-105 active:scale-95 transition-all"
        >
          <IFoodIcon className="h-6 sm:h-7" />
          Peça pelo iFood
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </main>
  );
}

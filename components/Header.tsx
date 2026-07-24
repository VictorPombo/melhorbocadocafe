"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOJA } from "@/lib/config";
import { IFoodIcon } from "@/components/Icons";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Esconde o Header nas rotas do painel administrativo
  if (pathname.startsWith("/gestao")) return null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Início", href: "/#inicio" },
    { label: "Cardápio", href: "/cardapio" },
    { label: "Sobre", href: "/#sobre" },
    { label: "Novidades", href: "/novidades" },
    { label: "Visite-nos", href: "/#visita" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg shadow-black/5 border-b border-white/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 md:h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt={`Logo ${LOJA.nomeCurto}`}
            width={140}
            height={65}
            className={`h-12 md:h-14 w-auto transition-all duration-300 ${
              scrolled ? "" : "drop-shadow-lg"
            }`}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Menu principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                scrolled
                  ? "text-gray-700 hover:text-rosa-600 hover:bg-rosa-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={LOJA.links.ifood}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rosa-500 to-magenta-600 text-white text-sm font-semibold shadow-lg shadow-rosa-500/25 hover:shadow-xl hover:shadow-rosa-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <IFoodIcon className="h-6" />
            Pedir no iFood
          </a>
        </nav>

        {/* Mobile: CTA + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={LOJA.links.ifood}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-rosa-500 to-magenta-600 text-white text-xs font-semibold shadow-lg shadow-rosa-500/25"
          >
            <IFoodIcon className="h-4" />
          </a>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2.5 rounded-xl transition-colors ${
              scrolled
                ? "text-rosa-600 hover:bg-rosa-50"
                : "text-white hover:bg-white/10"
            }`}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
          <nav className="fixed top-0 right-0 w-72 h-full bg-white z-50 shadow-2xl lg:hidden animate-slide-right" aria-label="Menu mobile">
            <div className="p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Fechar menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <Image src="/logo.png" alt="Logo" width={120} height={56} className="h-10 w-auto mb-8" />

              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-700 font-medium hover:bg-rosa-50 hover:text-rosa-600 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                <a
                  href={LOJA.links.ifood}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-rosa-500 to-magenta-600 text-white font-semibold shadow-lg"
                >
                  <IFoodIcon className="h-6" />
                  Pedir no iFood
                </a>
                <a
                  href={LOJA.links.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-rosa-200 text-rosa-600 font-semibold hover:bg-rosa-50"
                >
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

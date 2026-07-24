import Image from "next/image";
import { LOJA } from "@/lib/config";
import { IFoodIcon } from "@/components/Icons";

export default function Menu() {
  return (
    <section id="cardapio" className="py-16 md:py-28 px-5 sm:px-6 gradient-warm">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-rosa-500 mb-3">
            Cardápio
          </span>
          <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nossos <span className="gradient-text">Donuts</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed px-2">
            {LOJA.descricao}
          </p>
        </div>

        {/* Product cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {LOJA.destaques.map((item, i) => (
            <div
              key={item.nome}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-rosa-500/5 border border-rosa-100/50 hover:shadow-2xl hover:shadow-rosa-500/10 hover:-translate-y-2 transition-all duration-500"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.imagem}
                  alt={`${item.nome} — donut artesanal da Melhor Bocado Café Tatuapé`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-fredoka text-xl font-semibold text-gray-900 mb-2">
                  {item.nome}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.descricao}
                </p>
              </div>

              {/* Decorative accent */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-rosa-400 to-magenta-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l3 9h9l-7.5 5.5L19.5 24 12 18l-7.5 6 3-9.5L0 9h9z" /></svg>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <a
            href={LOJA.links.ifood}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rosa-500 to-magenta-600 text-white font-bold shadow-xl shadow-rosa-500/20 hover:shadow-2xl hover:shadow-rosa-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <IFoodIcon className="h-7" />
            Pedir pelo iFood
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href={LOJA.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl text-rosa-600 font-semibold hover:bg-rosa-50 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Ver mais no Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

import { LOJA } from "@/lib/config";

export default function Visit() {
  return (
    <section id="visita" className="py-16 md:py-28 px-5 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-rosa-500 mb-3">
            Visite-nos
          </span>
          <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Venha nos <span className="gradient-text">conhecer</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
            Estamos esperando você no coração do {LOJA.bairro}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          {/* Left column — info cards */}
          <div className="lg:col-span-2 space-y-5">
            {/* Address card */}
            <div className="bg-gradient-to-br from-rosa-50 to-magenta-500/5 rounded-3xl p-5 sm:p-6 border border-rosa-100/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rosa-500 to-magenta-600 flex items-center justify-center text-white shadow-lg shadow-rosa-500/20 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-fredoka text-lg font-semibold text-gray-900 mb-1">
                    Endereço
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {LOJA.endereco}
                  </p>
                </div>
              </div>
            </div>

            {/* Hours card */}
            <div className="bg-gradient-to-br from-rosa-50 to-magenta-500/5 rounded-3xl p-5 sm:p-6 border border-rosa-100/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rosa-500 to-magenta-600 flex items-center justify-center text-white shadow-lg shadow-rosa-500/20 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-fredoka text-lg font-semibold text-gray-900 mb-2">
                    Horário
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Seg – Sáb</span>
                      <span className="font-semibold text-gray-900">8h às 20h</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Domingo</span>
                      <span className="font-semibold text-gray-900">9h às 18h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={LOJA.mapa.direcoes}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl bg-white border-2 border-rosa-100 hover:border-rosa-300 hover:shadow-lg hover:shadow-rosa-500/10 hover:-translate-y-1 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">Google Maps</span>
              </a>

              <a
                href={LOJA.links.uber}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border-2 border-rosa-100 hover:border-rosa-300 hover:shadow-lg hover:shadow-rosa-500/10 hover:-translate-y-1 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center group-hover:bg-black transition-colors">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">Chamar Uber</span>
              </a>

              <a
                href={LOJA.links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border-2 border-rosa-100 hover:border-rosa-300 hover:shadow-lg hover:shadow-rosa-500/10 hover:-translate-y-1 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
              </a>

              <a
                href={LOJA.links.google}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border-2 border-rosa-100 hover:border-rosa-300 hover:shadow-lg hover:shadow-rosa-500/10 hover:-translate-y-1 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">Avaliar</span>
              </a>
            </div>
          </div>

          {/* Right column — map */}
          <div className="lg:col-span-3">
            <div className="map-container rounded-3xl overflow-hidden shadow-xl shadow-rosa-500/5 border border-rosa-100/50 h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[520px]">
              <iframe
                src={LOJA.mapa.embedUrl}
                title={`Mapa da ${LOJA.nome}`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[520px]"
                style={{ border: 0, borderRadius: "20px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

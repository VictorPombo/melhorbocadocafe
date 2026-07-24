import { LOJA } from "@/lib/config";

export default function Location() {
  return (
    <section id="localizacao" className="py-16 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-fredoka text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
            Localização
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-rosa-500 to-magenta-600 rounded-full mx-auto mb-6" />
        </div>

        {/* Address card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-rosa-500/5 border border-rosa-100 p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rosa-500 to-magenta-600 flex items-center justify-center shadow-lg shadow-rosa-500/20 shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {LOJA.bairro}
              </p>
              <p className="text-gray-500 mt-1">{LOJA.endereco}</p>
            </div>
          </div>

          <a
            href={LOJA.mapa.direcoes}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-como-chegar"
            className="inline-flex items-center gap-2 w-full justify-center py-4 px-6 bg-gradient-to-r from-rosa-500 to-magenta-600 text-white rounded-2xl font-semibold shadow-lg shadow-rosa-500/20 hover:shadow-xl hover:shadow-rosa-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Como chegar
          </a>
        </div>

        {/* Map */}
        <div className="map-container rounded-3xl overflow-hidden shadow-xl shadow-rosa-500/5 border border-rosa-100">
          <iframe
            src={LOJA.mapa.embedUrl}
            title={`Mapa da ${LOJA.nome}`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}

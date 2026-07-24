import Image from "next/image";
import { LOJA } from "@/lib/config";

export default function About() {
  return (
    <section id="sobre" className="py-16 md:py-28 px-5 sm:px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative aspect-[4/3] md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-rosa-500/10">
              <Image
                src="/cafe-ambiente.jpg"
                alt="Interior aconchegante da Melhor Bocado Café no Tatuapé, São Paulo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-4 md:-right-8 bg-white rounded-2xl shadow-xl shadow-rosa-500/10 p-4 sm:p-5 border border-rosa-100/50 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rosa-500 to-magenta-600 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
                <div>
                  <p className="font-fredoka font-bold text-gray-900 text-lg">4.9</p>
                  <p className="text-xs text-gray-400">Nota no Google</p>
                </div>
              </div>
            </div>

            {/* Decorative blob */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-rosa-200/30 rounded-full blur-2xl -z-10" />
          </div>

          {/* Text side */}
          <div>
            <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-rosa-500 mb-3">
              Sobre Nós
            </span>
            <h2 className="font-fredoka text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              A melhor parte do{" "}
              <span className="gradient-text">seu dia</span>
            </h2>

            <div className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed mb-8">
              <p>
                A <strong className="text-gray-900">{LOJA.nomeCurto}</strong> chegou ao{" "}
                <strong className="text-gray-900">{LOJA.bairro}</strong> com uma missão: trazer os legítimos{" "}
                <strong className="text-gray-900">donuts americanos artesanais</strong> para a Zona Leste de São Paulo.
              </p>
              <p>
                Nossa massa é preparada diariamente — leve, fresquinha e fermentada no ponto certo. As coberturas vão do{" "}
                <strong className="text-gray-900">glazed clássico</strong> ao{" "}
                <strong className="text-gray-900">chocolate belga</strong>, passando por pistache, frutas vermelhas e doce de leite.
              </p>
              <p>
                Além dos donuts, servimos{" "}
                <strong className="text-gray-900">café especial</strong> com grãos selecionados, bebidas geladas e um ambiente pensado para ser tão gostoso quanto o nosso menu.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { number: "100%", label: "Artesanal" },
                { number: "12+", label: "Sabores" },
                { number: "5", label: "Avaliações" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 sm:p-4 rounded-2xl bg-rosa-50/50 border border-rosa-100/50"
                >
                  <p className="font-fredoka text-2xl font-bold gradient-text">
                    {stat.number}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

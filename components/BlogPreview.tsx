import Image from "next/image";
import Link from "next/link";
import { POSTS } from "@/lib/posts";

export default function BlogPreview() {
  const latestPosts = POSTS.slice(0, 3);

  return (
    <section className="py-16 md:py-28 px-5 sm:px-6 gradient-brand-soft">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-rosa-500 mb-3">
              Blog
            </span>
            <h2 className="font-fredoka text-3xl md:text-4xl font-bold text-gray-900">
              Novidades
            </h2>
          </div>
          <Link
            href="/novidades"
            className="inline-flex items-center gap-2 text-rosa-600 font-semibold hover:gap-3 transition-all group"
          >
            Ver todas
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Symmetric 3-column grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/novidades/${post.slug}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-rosa-500/5 border border-rosa-100/50 hover:shadow-2xl hover:shadow-rosa-500/10 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.imagem}
                  alt={post.imagemAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <time dateTime={post.data} className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                    {new Date(post.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                  </time>
                  <h3 className="font-fredoka text-base sm:text-lg font-bold text-white mt-1 leading-snug drop-shadow-lg line-clamp-2">
                    {post.titulo}
                  </h3>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
                  {post.resumo}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-rosa-500 group-hover:gap-2 transition-all">
                  Ler mais
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

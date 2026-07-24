import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/posts";
import { LOJA } from "@/lib/config";
import PostCard from "@/components/PostCard";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: `Novidades | ${LOJA.nome}`,
  description: `Fique por dentro das novidades da ${LOJA.nome}. Dicas de sabores, eventos e tudo sobre donuts americanos no ${LOJA.bairro}.`,
  openGraph: {
    title: `Novidades | ${LOJA.nome}`,
    description: `Fique por dentro das novidades da ${LOJA.nome}. Dicas de sabores, eventos e tudo sobre donuts americanos no ${LOJA.bairro}.`,
    images: [{ url: LOJA.seo.ogImage }],
  },
};

export default function NovidadesPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 px-4 text-center text-white relative overflow-hidden">
        <div className="absolute top-10 right-[-40px] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar ao início
          </Link>
          <h1 className="font-fredoka text-3xl md:text-4xl font-semibold mb-3">
            Novidades
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            Fique por dentro do que acontece na {LOJA.nomeCurto}{" "}
            {LOJA.bairro}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            {POSTS.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {POSTS.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                Em breve teremos novidades por aqui!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

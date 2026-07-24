import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPostBySlug, getAllSlugs } from "@/lib/posts";
import { LOJA } from "@/lib/config";
import { JsonLdArticle } from "@/components/JsonLd";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.titulo} | ${LOJA.nomeCurto}`,
    description: post.resumo,
    openGraph: {
      title: post.titulo,
      description: post.resumo,
      images: [{ url: post.imagem }],
      type: "article",
      publishedTime: post.data,
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: post.titulo,
      description: post.resumo,
      images: [post.imagem],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLdArticle
        titulo={post.titulo}
        resumo={post.resumo}
        imagem={post.imagem}
        data={post.data}
        slug={post.slug}
      />

      {/* Hero */}
      <section className="gradient-hero pt-24 pb-4 px-4 text-white relative overflow-hidden">
        <div className="absolute top-10 left-[-40px] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link
            href="/novidades"
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
            Voltar às novidades
          </Link>
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

      {/* Article */}
      <article className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Date */}
          <time
            dateTime={post.data}
            className="text-sm font-medium text-rosa-500 uppercase tracking-wide"
          >
            {new Date(post.data + "T12:00:00").toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>

          {/* Title */}
          <h1 className="font-fredoka text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mt-3 mb-6 leading-tight">
            {post.titulo}
          </h1>

          {/* Featured image */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-xl mb-8">
            <Image
              src={post.imagem}
              alt={post.imagemAlt}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>

          {/* Content */}
          <div
            className="prose prose-lg prose-gray max-w-none
              prose-headings:font-fredoka prose-headings:text-gray-900
              prose-h2:text-xl prose-h2:md:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-strong:text-gray-900
              prose-a:text-rosa-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.conteudo }}
          />

          {/* CTA */}
          <div className="mt-12 p-6 bg-gradient-to-r from-rosa-50 to-magenta-500/5 rounded-3xl border border-rosa-100 text-center">
            <p className="font-fredoka text-lg font-semibold text-gray-900 mb-2">
              Quer experimentar?
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Visite a {LOJA.nomeCurto} no {LOJA.bairro} ou peça pelo iFood!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={LOJA.links.ifood}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-rosa-500 to-magenta-600 text-white rounded-2xl font-semibold shadow-lg shadow-rosa-500/20 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Peça no iFood
              </a>
              <a
                href={LOJA.links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-white text-rosa-600 border-2 border-rosa-200 rounded-2xl font-semibold hover:bg-rosa-50 hover:border-rosa-300 transition-all"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* More posts */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="font-fredoka text-xl font-semibold text-gray-900 mb-4">
              Mais novidades
            </h2>
            <div className="space-y-3">
              {POSTS.filter((p) => p.slug !== post.slug)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p.slug}
                    href={`/novidades/${p.slug}`}
                    className="block p-4 rounded-2xl hover:bg-rosa-50 transition-colors group"
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-rosa-600 transition-colors">
                      {p.titulo}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(p.data + "T12:00:00").toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}

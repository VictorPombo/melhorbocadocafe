import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/posts";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/novidades/${post.slug}`}
      className="group block bg-white rounded-3xl overflow-hidden shadow-lg shadow-rosa-500/5 border border-rosa-100 hover:shadow-xl hover:shadow-rosa-500/10 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={post.imagem}
          alt={post.imagemAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        <time
          dateTime={post.data}
          className="text-xs font-medium text-rosa-500 uppercase tracking-wide"
        >
          {new Date(post.data + "T12:00:00").toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
        <h3 className="font-fredoka text-lg font-semibold text-gray-900 mt-2 mb-2 group-hover:text-rosa-600 transition-colors leading-snug">
          {post.titulo}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {post.resumo}
        </p>

        <span className="inline-flex items-center gap-1 text-sm font-semibold text-rosa-500 mt-4 group-hover:gap-2 transition-all">
          Ler mais
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}

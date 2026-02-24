import Link from "next/link";
import { getVerseOfDay } from "@/lib/verseOfDay";

export const revalidate = 86400;

export default function HomePage() {
  const verse = getVerseOfDay();
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10">
      {/* HERO */}
      <section className="mx-auto max-w-6xl">
        <div
          className={[
            "relative overflow-hidden rounded-[28px]",
            "border border-white/10 bg-neutral-950/60",
            "shadow-[0_30px_120px_-40px_rgba(0,0,0,0.9)]",
          ].join(" ")}
        >
          {/* Fundo moderno (SEM imagem) */}
          <div className="pointer-events-none absolute inset-0">
            {/* glow amber */}
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
            {/* linhas sutis */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
          </div>

          <div className="relative p-7 sm:p-10 lg:p-12">
            <div className="text-[12px] tracking-[0.22em] text-amber-300/80">
              ESTUDO BÍBLICO
            </div>

            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05]">
              Toda quinta-feira às{" "}
              <span className="text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                21:00
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed">
              Um ambiente simples e moderno para acompanhar o estudo do dia, marcar presença
              e votar no próximo tema — tudo em tempo real.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/estudo"
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-5 py-3",
                  "bg-amber-500/20 ring-1 ring-amber-300/30",
                  "text-white/90 hover:bg-amber-500/30 transition active:scale-[0.98]",
                ].join(" ")}
              >
                Abrir estudo do dia <span aria-hidden>→</span>
              </Link>

              <Link
                href="/mes-a-mes"
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-5 py-3",
                  "bg-white/5 ring-1 ring-white/10",
                  "text-white/80 hover:bg-white/10 transition active:scale-[0.98]",
                ].join(" ")}
              >
                Calendário mês a mês
              </Link>

              <Link
                href="/votacao"
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-5 py-3",
                  "bg-white/5 ring-1 ring-white/10",
                  "text-white/80 hover:bg-white/10 transition active:scale-[0.98]",
                ].join(" ")}
              >
                Votação
              </Link>

              <Link
                href="/logout"
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-5 py-3",
                  "bg-white/5 ring-1 ring-white/10",
                  "text-white/80 hover:bg-white/10 transition active:scale-[0.98]",
                ].join(" ")}
              >
                Sair
              </Link>
            </div>

            <div className="mt-5 text-sm text-white/45">
              Dica: salva esse link na tela inicial do celular e usa como app.
            </div>
          </div>
        </div>
      </section>

      {/* VERSÍCULO DO DIA (igual ao print antigo) */}
      <section className="mx-auto max-w-6xl mt-8">
      <div className="rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)]">
        <div className="text-[12px] tracking-[0.22em] text-white/45">
          VERSÍCULO DO DIA
        </div>

        <div className="mt-3 text-lg sm:text-xl text-white/85 leading-relaxed">
          “{verse.text}”
        </div>

        <div className="mt-3 text-sm text-amber-300/90">
          {verse.reference}
        </div>
      </div>
    </section>

      {/* CARDS */}
      <section className="mx-auto max-w-6xl mt-10 grid gap-6 md:grid-cols-3">
        <Card
          tag="Estudo"
          title="Conteúdo do dia"
          desc="Resumo e textos bíblicos organizados por encontro."
          href="/estudo"
        />
        <Card
          tag="Presença"
          title="Marcar participação"
          desc="Um clique pra marcar/desmarcar. Contador atualiza na hora."
          href="/presenca"
        />
        <Card
          tag="Votação"
          title="Escolha do próximo tema"
          desc="Enquete em tempo real com resultado agregado (sem expor quem votou)."
          href="/votacao"
        />
      </section>
    </main>
  );
}

function Card({
  tag,
  title,
  desc,
  href,
}: {
  tag: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)]">
      <div className="text-xs text-white/45">{tag}</div>
      <div className="mt-2 text-2xl font-semibold">{title}</div>
      <div className="mt-2 text-white/60 leading-relaxed">{desc}</div>
      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 text-amber-300/90 hover:text-amber-200 transition"
      >
        Abrir <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
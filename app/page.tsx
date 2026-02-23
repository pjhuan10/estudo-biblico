"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const isLogged = useMemo(() => !!email, [email]);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setEmail(data.user?.email ?? null);
  }

  useEffect(() => {
    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* HERO */}
        <section
          className={[
            "animate-enter",
            "relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-white/5",
          ].join(" ")}
        >
          {/* bg image */}
          <div className="absolute inset-0">
            <img
              src="/hero.png"
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
            {/* overlays p/ dar vibe tech */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.22),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.07),transparent_55%)]" />
          </div>

          {/* content */}
          <div className="relative p-8 md:p-10">
            <div className="text-xs tracking-widest text-cyan-300/80">
              ESTUDO BÍBLICO
            </div>

            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              Toda quinta-feira às{" "}
              <span className="text-cyan-300">21:00</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base md:text-lg text-gray-200/80 leading-relaxed">
              Um ambiente simples e moderno para acompanhar o estudo do dia,
              marcar presença e votar no próximo tema — tudo em tempo real.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/estudo"
                className="group inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-cyan-500/20 ring-1 ring-cyan-300/30 hover:bg-cyan-500/30 transition active:scale-[0.99]"
              >
                <span className="font-medium">Abrir estudo do dia</span>
                <span className="ml-2 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>

              <a
                href="/mes-a-mes"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition active:scale-[0.99]"
              >
                Calendário mês a mês
              </a>

              <a
                href="/votacao"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition active:scale-[0.99]"
              >
                Votação
              </a>

              {isLogged ? (
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition active:scale-[0.99]"
                >
                  Sair
                </button>
              ) : (
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition active:scale-[0.99]"
                >
                  Entrar
                </a>
              )}
            </div>

            {/* micro detail */}
            <div className="mt-6 text-xs text-gray-300/70">
              Dica: salva esse link na tela inicial do celular e usa como app.
            </div>
          </div>
        </section>

        {/* CARDS */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card
            title="Conteúdo do dia"
            kicker="Estudo"
            desc="Resumo e textos bíblicos organizados por encontro."
            href="/estudo"
          />
          <Card
            title="Marcar participação"
            kicker="Presença"
            desc="Um clique pra marcar/desmarcar. Contador atualiza na hora."
            href="/estudo"
          />
          <Card
            title="Escolha do próximo tema"
            kicker="Votação"
            desc="Enquete em tempo real com resultado agregado (sem expor quem votou)."
            href="/votacao"
          />
        </section>
      </div>
    </main>
  );
}

function Card({
  kicker,
  title,
  desc,
  href,
}: {
  kicker: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className={[
        "animate-enter",
        "rounded-3xl bg-white/5 ring-1 ring-white/10 p-6",
        "hover:bg-white/7 hover:ring-white/20 transition",
        "active:scale-[0.99]",
      ].join(" ")}
    >
      <div className="text-xs text-gray-400">{kicker}</div>
      <div className="mt-2 text-xl font-semibold">{title}</div>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed">{desc}</p>
      <div className="mt-4 text-sm text-cyan-300/80">Abrir →</div>
    </a>
  );
}
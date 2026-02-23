"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getOpenPoll } from "@/lib/polls";
import { isAdmin } from "@/lib/admin";
import { motion } from "framer-motion";

function cx(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

export default function Home() {
  const [logged, setLogged] = useState(false);
  const [pollActive, setPollActive] = useState(false);
  const [admin, setAdmin] = useState(false);

  const voteLabel = useMemo(() => (pollActive ? "ativa" : "sem votação"), [pollActive]);

  async function load() {
    const { data } = await supabase.auth.getUser();
    setLogged(!!data.user);

    try {
      const p = await getOpenPoll();
      setPollActive(!!p);
    } catch {
      setPollActive(false);
    }

    try {
      setAdmin(await isAdmin());
    } catch {
      setAdmin(false);
    }
  }

  useEffect(() => {
    void load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: "easeOut" } },
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <motion.div
        className="mx-auto max-w-6xl px-6 py-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* HERO */}
        <motion.section
          variants={item}
          className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-white/5"
        >
          {/* background layers */}
          <img
            src="/hero.png"
            alt="Bíblia iluminada"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="aurora" />
          <div className="grain" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/80" />

          {/* content */}
          <div className="relative p-8 md:p-12">
            <div className="text-xs tracking-widest text-cyan-300/80">
              ESTUDO BÍBLICO
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Toda quinta-feira às{" "}
                <span className="text-cyan-300">21:00</span>
              </h1>

              <p className="max-w-2xl text-gray-200/90 leading-relaxed">
                Um ambiente simples e elegante para acompanhar o estudo do dia,
                marcar presença e votar no próximo tema — tudo em tempo real.
              </p>
            </div>

            {/* actions */}
            <div className="mt-7 flex flex-wrap gap-3">
              <ModernLink href="/estudo" primary>
                Abrir estudo do dia →
              </ModernLink>

              <ModernLink href="/mes-a-mes">
                Calendário mês a mês
              </ModernLink>

              <ModernLink href="/votacao">
                Votação • {voteLabel}
              </ModernLink>

              {!logged ? (
                <ModernLink href="/login">
                  Entrar
                </ModernLink>
              ) : (
                <ModernButton onClick={logout}>
                  Sair
                </ModernButton>
              )}
            </div>

            {admin && (
              <div className="mt-5 flex flex-wrap gap-3">
                <ModernLink href="/admin/estudos">
                  Admin • Estudos
                </ModernLink>
                <ModernLink href="/admin/votacao">
                  Admin • Votação
                </ModernLink>
              </div>
            )}
          </div>
        </motion.section>

        {/* CARDS */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Conteúdo do dia" subtitle="Estudo">
            Resumo e textos bíblicos organizados por encontro.
          </InfoCard>

          <InfoCard title="Marcar participação" subtitle="Presença">
            Um clique para marcar/desmarcar. Contador atualiza na hora.
          </InfoCard>

          <InfoCard title="Escolha do próximo tema" subtitle="Votação">
            Enquete em tempo real com resultado agregado (sem expor quem votou).
          </InfoCard>
        </div>

        <motion.div variants={item} className="mt-8 text-xs text-gray-500">
          Feito para seu grupo — e pronto pra você compartilhar com outros também.
        </motion.div>
      </motion.div>
    </main>
  );
}

function ModernLink({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={cx(
          "inline-flex items-center justify-center rounded-2xl px-6 py-3 font-medium transition",
          "ring-1 ring-white/10 bg-white/5 hover:bg-white/10",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
          primary && "bg-cyan-400 text-black ring-0 hover:bg-cyan-300"
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}

function ModernButton({
  onClick,
  children,
}: {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-medium transition ring-1 ring-white/10 bg-white/5 hover:bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
    >
      {children}
    </motion.button>
  );
}

function InfoCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 transition"
    >
      <p className="text-xs text-gray-400">{subtitle}</p>
      <p className="mt-2 text-lg font-medium">{title}</p>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed">{children}</p>
    </motion.div>
  );
}

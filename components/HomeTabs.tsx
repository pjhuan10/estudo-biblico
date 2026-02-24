"use client";

import { useMemo, useState } from "react";

type TabKey = "estudo" | "calendario" | "votacao";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function HomeTabs({
  isLogged,
  isAdmin,
}: {
  isLogged: boolean;
  isAdmin: boolean;
}) {
  const [tab, setTab] = useState<TabKey>("estudo");

  const items = useMemo(
    () => [
      { key: "estudo" as const, label: "Estudo" },
      { key: "calendario" as const, label: "Calendário" },
      { key: "votacao" as const, label: "Votação" },
    ],
    []
  );

  return (
    <section className="mt-8 animate-enter">
      <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
        {/* header */}
        <div className="p-6 md:p-7">
          <div className="text-xs tracking-widest text-gray-400">
            NAVEGAR PELO SITE
          </div>
          <div className="mt-2 text-xl md:text-2xl font-semibold">
            Escolha o que você quer fazer agora
          </div>

          {/* tabs */}
          <div className="mt-5 inline-flex rounded-2xl bg-black/30 ring-1 ring-white/10 p-1">
            {items.map((it) => {
              const active = tab === it.key;
              return (
                <button
                  key={it.key}
                  onClick={() => setTab(it.key)}
                  className={cx(
                    "px-4 py-2 rounded-xl text-sm transition",
                    active
                      ? "bg-white/10 ring-1 ring-white/15 text-amber-300"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* content */}
        <div className="border-t border-white/10 p-6 md:p-7">
          {tab === "estudo" && (
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                kicker="Estudo"
                title="Abrir estudo do dia"
                desc="Acompanhar o conteúdo do encontro e marcar presença."
                href="/estudo"
                primary
              />
              <ActionCard
                kicker="Presença"
                title="Marcar participação"
                desc="Marque/desmarque sua presença no encontro."
                href="/estudo"
              />
              <ActionCard
                kicker="Conta"
                title={isLogged ? "Sair" : "Entrar"}
                desc={
                  isLogged
                    ? "Encerrar sua sessão."
                    : "Entrar para votar e marcar presença."
                }
                href={isLogged ? "/#logout" : "/login"}
                onClick={isLogged ? () => document.dispatchEvent(new Event("app:logout")) : undefined}
              />
            </div>
          )}

          {tab === "calendario" && (
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                kicker="Calendário"
                title="Mês a mês"
                desc="Navegue pelos estudos anteriores e próximos."
                href="/mes-a-mes"
                primary
              />
              <ActionCard
                kicker="Atalho"
                title="Próximo estudo"
                desc="Ir direto pro estudo do dia."
                href="/estudo"
              />
              <ActionCard
                kicker="Dica"
                title="Use como app"
                desc="No iPhone: Compartilhar → Adicionar à Tela de Início."
                href="/"
              />
            </div>
          )}

          {tab === "votacao" && (
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                kicker="Votação"
                title="Votar / ver resultados"
                desc="Enquete em tempo real (resultado agregado)."
                href="/votacao"
                primary
              />
              <ActionCard
                kicker="Regras"
                title="Como funciona"
                desc="A votação abre quando o admin criar uma enquete."
                href="/votacao"
              />
              <ActionCard
                kicker="Admin"
                title="Painel de votação"
                desc={
                  isAdmin
                    ? "Criar/fechar votação e adicionar opções."
                    : "Disponível apenas para admin."
                }
                href={isAdmin ? "/admin/votacao" : "/"}
                disabled={!isAdmin}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ActionCard({
  kicker,
  title,
  desc,
  href,
  primary,
  disabled,
  onClick,
}: {
  kicker: string;
  title: string;
  desc: string;
  href: string;
  primary?: boolean;
  disabled?: boolean;
  onClick?: (() => void) | undefined;
}) {
  const base = cx(
    "rounded-3xl ring-1 p-6 transition",
    "active:scale-[0.99]",
    disabled ? "opacity-50 pointer-events-none" : "hover:ring-white/20"
  );

  const colors = primary
    ? "bg-amber-500/15 ring-amber-400/25 hover:bg-amber-500/20"
    : "bg-white/5 ring-white/10 hover:bg-white/7";

  // link normal
  if (!onClick) {
    return (
      <a href={href} className={cx(base, colors)}>
        <div className="text-xs text-gray-400">{kicker}</div>
        <div className="mt-2 text-lg font-semibold">{title}</div>
        <p className="mt-2 text-sm text-gray-300 leading-relaxed">{desc}</p>
        <div className="mt-4 text-sm text-amber-300/80">Abrir →</div>
      </a>
    );
  }

  // button-like card
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("text-left w-full", base, colors)}
    >
      <div className="text-xs text-gray-400">{kicker}</div>
      <div className="mt-2 text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed">{desc}</p>
      <div className="mt-4 text-sm text-amber-300/80">Ação →</div>
    </button>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Item = {
  label: string;
  href?: string;
  section?: string;
  highlight?: boolean;
  adminOnly?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export default function SideDrawer({
  isAdmin,
  onLogout,
}: {
  isAdmin: boolean;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // fecha ao trocar de rota
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC fecha
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // bloqueia scroll do fundo (mobile principalmente)
  useEffect(() => {
    if (!mounted) return;

    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = (document.body.style as any).overscrollBehavior as string | undefined;

    if (open) {
      document.body.style.overflow = "hidden";
      (document.body.style as any).overscrollBehavior = "contain";
    } else {
      document.body.style.overflow = prevOverflow || "";
      (document.body.style as any).overscrollBehavior = prevOverscroll || "";
    }

    return () => {
      document.body.style.overflow = prevOverflow || "";
      (document.body.style as any).overscrollBehavior = prevOverscroll || "";
    };
  }, [open, mounted]);

  const items: Item[] = useMemo(
    () => [
      { section: "Geral", label: "Página inicial", href: "/" },
      { label: "Estudo do dia", href: "/estudo" },
      { label: "Votação do grupo", href: "/votacao" },

      { section: "Organização", label: "Mês a mês", href: "/mes-a-mes" },

      { section: "Acesso rápido", label: "Instalar app", href: "/instalar", highlight: true },

      { section: "Admin", label: "Painel admin", href: "/admin", adminOnly: true },
      { label: "Admin • Estudos", href: "/admin/estudos", adminOnly: true },
      { label: "Admin • Votação", href: "/admin/votacao", adminOnly: true },

      ...(onLogout
        ? [{ section: "Conta", label: "Sair", onClick: onLogout } as Item]
        : []),
    ],
    [onLogout]
  );

  const visibleItems = items.filter((it) => (it.adminOnly ? isAdmin : true));

  const overlay = (
    <div
      className={cx(
        "fixed inset-0 z-[9999]",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cx(
          "absolute inset-0 bg-black/80 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* painel */}
      <aside
        className={cx(
          "fixed left-0 top-0 h-dvh w-[86%] max-w-[340px]",
          "bg-neutral-950",
          "ring-1 ring-white/10",
          "shadow-[24px_0_80px_-24px_rgba(0,0,0,0.95)]",
          "transition-transform duration-200 will-change-transform",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 ring-1 ring-amber-400/30 flex items-center justify-center font-semibold">
                EB
              </div>
              <div>
                <div className="font-semibold">Estudo Bíblico</div>
                <div className="text-xs text-gray-400">quinta • 21:00 • ao vivo</div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="h-10 w-10 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
              aria-label="Fechar menu"
              title="Fechar"
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="mt-6 space-y-4">{renderSections(visibleItems, pathname)}</div>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      {/* botão + */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cx(
          "inline-flex items-center justify-center",
          "h-10 w-10 rounded-2xl",
          "bg-amber-500/20 ring-1 ring-amber-400/30 hover:bg-amber-500/30",
          "transition active:scale-[0.98]"
        )}
        aria-label="Abrir menu"
        title="Menu"
      >
        <span className="text-2xl leading-none">+</span>
      </button>

      {/* IMPORTANTÍSSIMO: Portal para fora do header (resolve transparência/mistura) */}
      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}

function renderSections(items: Item[], pathname: string) {
  const out: React.ReactNode[] = [];
  let currentSection: string | undefined;

  const pushSectionTitle = (title: string) => {
    out.push(
      <div key={`sec-${title}`} className="mt-4">
        <div className="text-[11px] tracking-[0.25em] text-gray-500 uppercase">
          {title}
        </div>
      </div>
    );
  };

  items.forEach((it, idx) => {
    if (it.section && it.section !== currentSection) {
      currentSection = it.section;
      pushSectionTitle(currentSection);
    }

    const isActive = it.href ? pathname === it.href : false;

    out.push(
      <div key={`item-${idx}`} className="mt-2">
        {it.href ? (
          <a
            href={it.href}
            className={cx(
              "flex items-center gap-3 rounded-2xl px-4 py-3",
              "transition ring-1",
              it.highlight
                ? "bg-amber-500/15 ring-amber-400/25 hover:bg-amber-500/20"
                : "bg-white/0 ring-white/0 hover:bg-white/5 hover:ring-white/10",
              isActive && !it.highlight ? "bg-white/5 ring-white/10" : "",
              it.disabled ? "opacity-50 pointer-events-none" : ""
            )}
          >
            <span className={cx("text-sm", it.highlight ? "text-amber-200" : "text-gray-200")}>
              {it.label}
            </span>
          </a>
        ) : (
          <button
            type="button"
            onClick={it.onClick}
            className={cx(
              "w-full text-left flex items-center gap-3 rounded-2xl px-4 py-3",
              "transition ring-1",
              "bg-white/0 ring-white/0 hover:bg-white/5 hover:ring-white/10"
            )}
          >
            <span className="text-sm text-gray-200">{it.label}</span>
          </button>
        )}
      </div>
    );
  });

  return out;
}
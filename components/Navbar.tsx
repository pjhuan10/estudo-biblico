"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

type NavItem = {
  href: string;
  label: string;
};

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function initialsFromEmail(email?: string | null) {
  if (!email) return "U";
  const left = email.split("@")[0] ?? "u";
  const a = (left[0] ?? "u").toUpperCase();
  const b = (left[1] ?? "").toUpperCase();
  return (a + b).trim() || "U";
}

export default function Navbar() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const items: NavItem[] = useMemo(
    () => [
      { href: "/", label: "Início" },
      { href: "/estudo", label: "Próximo estudo" },
      { href: "/mes-a-mes", label: "Mês a mês" },
      { href: "/votacao", label: "Votação" },
    ],
    []
  );

  async function load() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    setAuthed(!!user);
    setEmail(user?.email ?? null);

    if (!user) {
      setAdmin(false);
      return;
    }

    try {
      const ok = await isAdmin();
      setAdmin(ok);
    } catch {
      setAdmin(false);
    }
  }

  useEffect(() => {
    void load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  async function logout() {
    setMenuOpen(false);
    await supabase.auth.signOut();
  }

  const avatarText = initialsFromEmail(email);
  const showOnHome = pathname === "/";
  const active = (href: string) => (pathname === href ? true : pathname?.startsWith(href + "/"));

  return (
    <header className="sticky top-0 z-50">
      {/* subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-cyan-500/10 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div
          className={clsx(
            "relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl",
            "shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            {/* Brand */}
            <Link
              href="/"
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2",
                "hover:bg-white/5 active:scale-[0.99] transition"
              )}
              onClick={() => setMenuOpen(false)}
            >
              <div className="relative h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/35 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-white/5" />
                <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-cyan-200">
                  EB
                </div>
              </div>

              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">Estudo Bíblico</div>
                <div className="text-xs text-gray-400 -mt-0.5">
                  quinta • 21:00 • ao vivo
                </div>
              </div>
            </Link>

            {/* Center nav */}
            <nav className="hidden md:flex items-center gap-2">
              {items.map((it) => {
                const isActive = active(it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={clsx(
                      "relative rounded-xl px-4 py-2 text-sm transition",
                      "hover:bg-white/5 active:scale-[0.99]",
                      isActive ? "text-white" : "text-gray-200"
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="relative z-10">{it.label}</span>

                    {/* underline glow */}
                    <span
                      className={clsx(
                        "absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full transition",
                        isActive ? "bg-cyan-400/80" : "bg-transparent"
                      )}
                    />
                  </Link>
                );
              })}

              {admin && (
                <Link
                  href="/admin/estudos"
                  className={clsx(
                    "ml-2 rounded-xl px-4 py-2 text-sm transition",
                    "bg-cyan-500/10 ring-1 ring-cyan-300/25 hover:bg-cyan-500/15 active:scale-[0.99]"
                  )}
                  onClick={() => setMenuOpen(false)}
                  title="Área Admin"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {!authed ? (
                <Link
                  href="/login"
                  className={clsx(
                    "rounded-xl px-4 py-2 text-sm transition",
                    "bg-cyan-500/20 ring-1 ring-cyan-300/30 hover:bg-cyan-500/30 active:scale-[0.99]"
                  )}
                >
                  Entrar
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className={clsx(
                      "flex items-center gap-2 rounded-xl px-3 py-2 transition",
                      "hover:bg-white/5 active:scale-[0.99] ring-1 ring-white/10 bg-white/5"
                    )}
                    aria-label="Abrir menu do usuário"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 text-sm font-semibold text-cyan-200">
                      {avatarText}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium leading-tight">Conta</div>
                      <div className="text-xs text-gray-400 leading-tight">Menu</div>
                    </div>
                    <div className={clsx("text-gray-300 transition", menuOpen ? "rotate-180" : "")}>
                      ▾
                    </div>
                  </button>

                  {/* dropdown */}
                  {menuOpen && (
                    <>
                      <button
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Fechar menu"
                      />
                      <div
                        className={clsx(
                          "absolute right-0 mt-2 z-50 w-56 overflow-hidden rounded-2xl",
                          "border border-white/10 bg-black/60 backdrop-blur-xl",
                          "shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
                          "animate-[fadeUp_.18s_ease-out]"
                        )}
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <div className="text-xs text-gray-400">Logado</div>
                          <div className="text-sm text-gray-200 truncate">
                            {/* não expõe email grande; só mostra se quiser */}
                            {email ? email.replace(/(.{2}).+(@.+)/, "$1…$2") : "Usuário"}
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            href="/"
                            className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5 transition"
                            onClick={() => setMenuOpen(false)}
                          >
                            Início
                          </Link>

                          <Link
                            href="/estudo"
                            className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5 transition"
                            onClick={() => setMenuOpen(false)}
                          >
                            Próximo estudo
                          </Link>

                          <Link
                            href="/mes-a-mes"
                            className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5 transition"
                            onClick={() => setMenuOpen(false)}
                          >
                            Mês a mês
                          </Link>

                          <Link
                            href="/votacao"
                            className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5 transition"
                            onClick={() => setMenuOpen(false)}
                          >
                            Votação
                          </Link>

                          {admin && (
                            <div className="mt-2 border-t border-white/10 pt-2">
                              <Link
                                href="/admin/estudos"
                                className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5 transition"
                                onClick={() => setMenuOpen(false)}
                              >
                                Admin • Estudos
                              </Link>
                              <Link
                                href="/admin/votacao"
                                className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5 transition"
                                onClick={() => setMenuOpen(false)}
                              >
                                Admin • Votação
                              </Link>
                            </div>
                          )}

                          <div className="mt-2 border-t border-white/10 pt-2">
                            <button
                              onClick={logout}
                              className="w-full text-left rounded-xl px-3 py-2 text-sm hover:bg-white/5 transition text-rose-200"
                            >
                              Sair
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mobile quick menu */}
              <button
                className={clsx(
                  "md:hidden rounded-xl px-3 py-2 transition",
                  "bg-white/5 ring-1 ring-white/10 hover:bg-white/10 active:scale-[0.99]"
                )}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Abrir menu"
                title="Menu"
              >
                ☰
              </button>
            </div>
          </div>

          {/* mobile nav bar (simple) */}
          <div className="md:hidden border-t border-white/10 px-3 py-2">
            <div className="flex flex-wrap gap-2">
              {items.map((it) => {
                const isActive = active(it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setMenuOpen(false)}
                    className={clsx(
                      "rounded-xl px-3 py-2 text-sm transition ring-1",
                      isActive
                        ? "bg-cyan-500/15 ring-cyan-300/25"
                        : "bg-white/5 ring-white/10 hover:bg-white/10"
                    )}
                  >
                    {it.label}
                  </Link>
                );
              })}
              {admin && (
                <Link
                  href="/admin/estudos"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm bg-cyan-500/10 ring-1 ring-cyan-300/25 hover:bg-cyan-500/15 transition"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* only on home: subtle bottom glow line */}
          {showOnHome && <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />}
        </div>
      </div>

      {/* local keyframes without touching globals */}
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}

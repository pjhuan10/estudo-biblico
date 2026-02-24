"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin as isAdminFn } from "@/lib/admin";
import SideDrawer from "@/components/SideDrawer";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    const em = data.user?.email ?? null;
    setEmail(em);

    if (em) {
      try {
        const ok = await isAdminFn();
        setIsAdmin(ok);
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  useEffect(() => {
    loadUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-black/70 backdrop-blur-xl ring-1 ring-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Drawer (mobile e desktop) */}
          <SideDrawer isAdmin={isAdmin} onLogout={email ? logout : undefined} />

          <div className="leading-tight">
            <div className="font-semibold">Estudo Bíblico</div>
            <div className="text-xs text-gray-400">quinta • 21:00</div>
          </div>
        </div>

        {/* navegação “limpa” (desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="/">Início</NavLink>
          <NavLink href="/estudo">Próximo estudo</NavLink>
          <NavLink href="/mes-a-mes">Mês a mês</NavLink>
          <NavLink href="/votacao">Votação</NavLink>
          {isAdmin && <NavLink href="/admin">Admin</NavLink>}
        </nav>

        {/* conta */}
        <div className="flex items-center gap-2">
          {email ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                <div className="h-8 w-8 rounded-2xl bg-amber-500/20 ring-1 ring-amber-400/30 flex items-center justify-center text-sm font-semibold">
                  PJ
                </div>
                <div className="text-sm text-gray-200">Conta</div>
              </div>

              <button
                onClick={logout}
                className={cx(
                  "rounded-2xl px-4 py-2",
                  "bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                )}
              >
                Sair
              </button>
            </>
          ) : (
            <a
              href="/login"
              className={cx(
                "rounded-2xl px-4 py-2",
                "bg-amber-500/20 ring-1 ring-amber-400/30 hover:bg-amber-500/30 transition"
              )}
            >
              Entrar
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-2xl px-4 py-2 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition text-sm"
    >
      {children}
    </a>
  );
}
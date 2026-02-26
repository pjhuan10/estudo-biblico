"use client";

import { useEffect } from "react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function AiPopup({
  open,
  onClose,
  children,
  title = "Assistente bíblico",
  subtitle = "Objetivo, respeitoso e com referências.",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  // ESC fecha
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // trava scroll do fundo
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cx(
            "relative isolate overflow-hidden",
            "w-full max-w-[560px]",
            "rounded-[28px]",
            "bg-neutral-950",
            "ring-1 ring-white/10",
            "shadow-[0_30px_120px_-40px_rgba(0,0,0,0.95)]"
          )}
        >
          {/* garante fundo sólido (sem transparência/blur) */}
          <div className="absolute inset-0 bg-neutral-950" />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white/90">{title}</div>
                <div className="text-sm text-white/50">{subtitle}</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl px-4 py-2 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition text-white/80"
              >
                Fechar
              </button>
            </div>

            <div className="mt-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

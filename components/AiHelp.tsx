"use client";

import { Bot } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function AiHelp() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! Posso ajudar com dúvidas bíblicas. Pergunte sobre versículos, contexto histórico ou aplicações.",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }, [open, messages.length]);

  const canSend = useMemo(() => !!text.trim() && !loading, [text, loading]);

  async function send() {
    const msg = text.trim();
    if (!msg || loading) return;

    const userMsg: Msg = { role: "user", content: msg };

    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
    setText("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].slice(-10);

      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!r.ok) {
  const t = await r.text().catch(() => "");
  throw new Error(t || "Falha ao responder.");
}
if (!r.body) throw new Error("Streaming indisponível.");

      const reader = r.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        acc += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }

      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last.role === "assistant" && !last.content.trim()) {
          copy[copy.length - 1] = { role: "assistant", content: "Sem resposta agora." };
        }
        return copy;
      });
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "Não consegui responder agora." };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* BOTÃO FIXO — "HOME STYLE" (amber elegante + grid + glow suave) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir assistente"
        className={cx(
          "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full",
          "grid place-items-center",
          "ring-1 ring-white/10",
          "bg-neutral-950/70 backdrop-blur",
          "shadow-[0_18px_60px_-18px_rgba(0,0,0,0.9)]",
          "transition-transform hover:scale-105 active:scale-[0.98]"
        )}
      >
        {/* glow igual home */}
        <span className="pointer-events-none absolute inset-0 rounded-full">
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.35),transparent_55%)]" />
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_70%_80%,rgba(253,230,138,0.18),transparent_55%)]" />
          <span className="absolute inset-0 rounded-full opacity-[0.07] bg-[linear-gradient(to_right,rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:14px_14px]" />
        </span>

        {/* ícone — sem amarelo chapado */}
      <Bot className="relative h-6 w-6 text-amber-200/90" strokeWidth={1.6} />
      </button>

      {/* CHAT */}
      {open && (
        <div
          className={cx(
            "fixed bottom-24 right-6 z-50 w-[92vw] max-w-md overflow-hidden",
            "rounded-[28px]",
            "border border-white/10",
            "bg-neutral-950/75 backdrop-blur-xl",
            "shadow-[0_40px_140px_-70px_rgba(0,0,0,0.95)]"
          )}
        >
          {/* Fundo igual home (grid + glow) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-amber-500/12 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/8 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:26px_26px]" />
          </div>

          <div className="relative">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Assistente bíblico</div>
                <div className="text-xs text-white/50">Objetivo, respeitoso e com referências.</div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className={cx(
                  "rounded-xl px-3 py-1 text-xs",
                  "bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                )}
              >
                Fechar
              </button>
            </div>

            <div ref={listRef} className="max-h-[55vh] overflow-auto p-4 space-y-3 text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cx(
                    "rounded-2xl px-4 py-3 ring-1",
                    m.role === "user"
                      ? "bg-white/5 ring-white/10 ml-10"
                      : "bg-white/5 ring-amber-300/15 mr-10"
                  )}
                >
                  <div className="text-xs text-white/45 mb-1">{m.role === "user" ? "Você" : "IA"}</div>
                  <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                    {m.content || (m.role === "assistant" && loading ? "Respondendo..." : "")}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder='Ex: "Qual o contexto de Romanos 8:28?"'
                  className={cx(
                    "flex-1 rounded-2xl px-4 py-3 text-sm",
                    "bg-white/5 ring-1 ring-white/10 outline-none",
                    "focus:ring-amber-300/25"
                  )}
                />

                <button
                  onClick={send}
                  disabled={!canSend}
                  className={cx(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition",
                    canSend
                      ? "bg-white/5 ring-1 ring-amber-300/25 hover:bg-white/10 active:scale-[0.98]"
                      : "bg-white/5 ring-1 ring-white/10 opacity-60 cursor-not-allowed"
                  )}
                >
                  Enviar
                </button>
              </div>

              <div className="mt-2 text-[11px] text-white/45">
                Dica: pergunte contexto histórico, significado de palavras, aplicações e referências cruzadas.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
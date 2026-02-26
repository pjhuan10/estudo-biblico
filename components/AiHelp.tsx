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

  // trava scroll do fundo quando o popup estiver aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
      {/* botão flutuante */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir assistente"
        className={cx(
          "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full",
          "grid place-items-center",
          "ring-1 ring-white/10",
          "bg-neutral-950/80",
          "shadow-[0_18px_60px_-18px_rgba(0,0,0,0.9)]",
          "transition-transform hover:scale-105 active:scale-[0.98]"
        )}
      >
        <Bot className="h-6 w-6 text-amber-200/90" strokeWidth={1.6} />
      </button>

      {/* overlay + popup */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* overlay escuro */}
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
          />

          {/* popup (sólido, sem vidro/transparência) */}
          <div
            className={cx(
              "absolute bottom-24 right-6 w-[92vw] max-w-md overflow-hidden",
              "rounded-[28px]",
              "border border-white/10",
              "bg-neutral-950",
              "shadow-[0_40px_140px_-70px_rgba(0,0,0,0.95)]",
              "isolate"
            )}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white/90">Assistente bíblico</div>
                <div className="text-xs text-white/50">Objetivo, respeitoso e com referências.</div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className={cx(
                  "rounded-xl px-3 py-1 text-xs",
                  "bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition text-white/80"
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
                  <div className="text-xs text-white/45 mb-1">
                    {m.role === "user" ? "Você" : "IA"}
                  </div>
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
                    "focus:ring-amber-300/25 text-white/90 placeholder:text-white/40"
                  )}
                />

                <button
                  onClick={send}
                  disabled={!canSend}
                  className={cx(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition",
                    canSend
                      ? "bg-white/5 ring-1 ring-amber-300/25 hover:bg-white/10 active:scale-[0.98] text-white/90"
                      : "bg-white/5 ring-1 ring-white/10 opacity-60 cursor-not-allowed text-white/70"
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

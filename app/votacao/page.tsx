"use client";

import BackButton from "@/components/BackButton";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMyVoteOptionId, getOpenPoll, getPollResults, vote } from "@/lib/polls";
import type { PollOption } from "@/lib/polls";

function errToText(e: any): string {
  if (!e) return "Erro inesperado";
  if (typeof e === "string") return e;
  if (e?.message) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export default function VotacaoPage() {
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState<Awaited<ReturnType<typeof getOpenPoll>>>(null);
  const [myOptionId, setMyOptionId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const totalVotes = useMemo(() => {
    return Object.values(results).reduce((acc, v) => acc + v, 0);
  }, [results]);

  async function loadAllSafe(from?: string) {
    try {
      const p = await getOpenPoll();
      setPoll(p);

      if (!p) {
        setMyOptionId(null);
        setResults({});
        return;
      }

      const [mine, res] = await Promise.all([getMyVoteOptionId(p.id), getPollResults(p.id)]);
      setMyOptionId(mine);
      setResults(res);
    } catch (e: any) {
      console.error("[votacao] loadAllSafe error", from, e);
      setMsg(errToText(e));
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await loadAllSafe("boot");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Realtime: polls mudou → recarrega
  useEffect(() => {
    const channel = supabase
      .channel("user-polls-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "polls" }, () => {
        void loadAllSafe("realtime:polls");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Realtime: votos/opções da poll ativa
  useEffect(() => {
    if (!poll?.id) return;

    const pollId = poll.id;

    const channel = supabase
      .channel(`user-poll-${pollId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_votes", filter: `poll_id=eq.${pollId}` },
        () => {
          void (async () => {
            try {
              const res = await getPollResults(pollId);
              setResults(res);
            } catch (e: any) {
              console.error("[votacao] realtime votes error", e);
              setMsg(errToText(e));
            }
          })();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_options", filter: `poll_id=eq.${pollId}` },
        () => {
          void loadAllSafe("realtime:options");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll?.id]);

  async function onVote(optionId: string) {
    if (!poll) return;

    try {
      setMsg(null);
      await vote(poll.id, optionId);
      setMyOptionId(optionId);

      const res = await getPollResults(poll.id);
      setResults(res);

      setMsg("Voto registrado ✅");
    } catch (e: any) {
      console.error("[votacao] vote error", e);
      setMsg(errToText(e));
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto p-8">
          <BackButton />
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 transition-all duration-200 hover:bg-white/10 hover:ring-white/20">
            Carregando…
          </div>
        </div>
      </main>
    );
  }

  if (!poll) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto p-8">
          <BackButton />
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 transition-all duration-200 hover:bg-white/10 hover:ring-white/20">
            <h1 className="text-xl font-semibold">Votação</h1>
            <p className="mt-2 text-sm text-gray-300">Nenhuma votação ativa no momento.</p>
            {msg && <p className="mt-4 text-sm text-rose-300">{msg}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-8">
        <BackButton />

        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 transition-all duration-200 hover:bg-white/10 hover:ring-white/20">
          <h1 className="text-2xl font-semibold tracking-tight">{poll.title}</h1>
          {poll.description && <p className="mt-2 text-sm text-gray-300">{poll.description}</p>}
          <p className="mt-1 text-sm text-gray-400">Realtime ativo ✅</p>

          <div className="mt-6 space-y-3">
            {poll.options.map((opt: PollOption) => {
              const votes = results[opt.id] ?? 0;
              const pct = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
              const selected = myOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  disabled={!!myOptionId}
                  onClick={() => onVote(opt.id)}
                  className={[
                    "w-full text-left rounded-2xl p-4 ring-1 transition-all duration-150 ease-out",
                    "hover:-translate-y-[1px] hover:scale-[1.01] active:scale-[0.99]",
                    selected
                      ? "bg-amber-500/15 ring-amber-400/30"
                      : "bg-black/30 ring-white/10 hover:bg-white/5",
                    myOptionId
                      ? "opacity-80 cursor-not-allowed hover:translate-y-0 hover:scale-100 active:scale-100"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-base">{opt.text}</div>
                    <div className="text-sm text-gray-300">
                      {votes} • {pct}%
                    </div>
                  </div>

                  <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-2 bg-amber-500/80 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Total de votos: <span className="text-gray-200">{totalVotes}</span>
          </div>

          {myOptionId && <div className="mt-3 text-sm text-amber-300">Você já votou ✅</div>}

          {msg && <p className="mt-4 text-sm text-rose-300">{msg}</p>}
        </div>
      </div>
    </main>
  );
}

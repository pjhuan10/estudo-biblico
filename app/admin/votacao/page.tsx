"use client";

import { useEffect, useMemo, useState } from "react";
import { isAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import {
  addOption,
  closePoll,
  createPoll,
  deleteOption,
  getActivePoll,
  listOptions,
  type Poll,
  type PollOption,
} from "@/lib/pollsAdmin";
import { getPollResults } from "@/lib/polls";

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

export default function AdminVotacaoPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [results, setResults] = useState<Record<string, number>>({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newOption, setNewOption] = useState("");

  const totalVotes = useMemo(() => {
    return Object.values(results).reduce((acc, v) => acc + v, 0);
  }, [results]);

  async function loadAllSafe(from?: string) {
    try {
      const poll = await getActivePoll();
      setActivePoll(poll);

      if (!poll) {
        setOptions([]);
        setResults({});
        return;
      }

      const [opts, res] = await Promise.all([listOptions(poll.id), getPollResults(poll.id)]);
      setOptions(opts);
      setResults(res);
    } catch (e: any) {
      console.error("[admin/votacao] loadAllSafe error", from, e);
      setErrorMsg(errToText(e));
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setErrorMsg(null);
        const ok = await isAdmin();
        setAllowed(ok);

        if (!ok) {
          const { data } = await supabase.auth.getUser();
          if (!data.user) setErrorMsg("Você não está logado. Faça login e tente novamente.");
          return;
        }

        await loadAllSafe("boot");
      } catch (e: any) {
        console.error("[admin/votacao] boot error", e);
        setErrorMsg(errToText(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!allowed) return;

    const channel = supabase
      .channel("admin-polls-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "polls" }, () => {
        void loadAllSafe("realtime:polls");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [allowed]);

  useEffect(() => {
    if (!allowed) return;
    if (!activePoll?.id) return;

    const pollId = activePoll.id;

    const channel = supabase
      .channel(`admin-poll-${pollId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_votes", filter: `poll_id=eq.${pollId}` },
        () => {
          void (async () => {
            try {
              const res = await getPollResults(pollId);
              setResults(res);
            } catch (e: any) {
              console.error("[admin/votacao] realtime votes error", e);
              setErrorMsg(errToText(e));
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
  }, [allowed, activePoll?.id]);

  async function onCreatePoll() {
    const t = title.trim();
    if (!t) return alert("Informe o título da votação");

    setLoading(true);
    setErrorMsg(null);

    try {
      await createPoll(t, description.trim() || null);
      setTitle("");
      setDescription("");
      setNewOption("");
      await loadAllSafe("createPoll");
      alert("Votação criada (a anterior foi fechada automaticamente).");
    } catch (e: any) {
      console.error("[admin/votacao] createPoll error", e);
      setErrorMsg(errToText(e));
    } finally {
      setLoading(false);
    }
  }

  async function onClosePoll() {
    if (!activePoll) return;
    if (!confirm("Encerrar a votação ativa agora?")) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await closePoll(activePoll.id);
      await loadAllSafe("closePoll");
    } catch (e: any) {
      console.error("[admin/votacao] closePoll error", e);
      setErrorMsg(errToText(e));
    } finally {
      setLoading(false);
    }
  }

  async function onAddOption() {
    if (!activePoll) return alert("Crie uma votação primeiro");
    const text = newOption.trim();
    if (!text) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await addOption(activePoll.id, text);
      setNewOption("");
      await loadAllSafe("addOption");
    } catch (e: any) {
      console.error("[admin/votacao] addOption error", e);
      setErrorMsg(errToText(e));
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteOption(optionId: string) {
    if (!confirm("Apagar esta opção?")) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await deleteOption(optionId);
      await loadAllSafe("deleteOption");
    } catch (e: any) {
      console.error("[admin/votacao] deleteOption error", e);
      setErrorMsg(errToText(e));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">Carregando…</div>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
            <h1 className="text-xl font-semibold">Acesso negado</h1>
            <p className="mt-2 text-sm text-gray-300">Esta página é restrita para administradores.</p>
            {errorMsg && <p className="mt-4 text-sm text-rose-300">{errorMsg}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Admin • Votação</h1>
          <p className="mt-1 text-sm text-gray-400">Realtime ativo ✅</p>
          {errorMsg && <p className="mt-3 text-sm text-rose-300">{errorMsg}</p>}
        </header>

        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
          <h2 className="text-lg font-semibold">Criar nova votação</h2>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-300">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Qual o tema do próximo estudo?"
                className="mt-1 w-full rounded-xl bg-black/40 px-4 py-3 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Descrição (opcional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Vote até domingo"
                className="mt-1 w-full rounded-xl bg-black/40 px-4 py-3 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={onCreatePoll}
              className="rounded-xl px-4 py-3 bg-amber-500/90 hover:bg-amber-500 text-black font-medium"
            >
              Criar votação (fecha a anterior)
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Votação ativa</h2>

              {activePoll && (
                <button
                  onClick={onClosePoll}
                  className="text-xs rounded-xl px-3 py-2 bg-white/10 ring-1 ring-white/10 hover:bg-white/15"
                >
                  Encerrar
                </button>
              )}
            </div>

            {!activePoll ? (
              <p className="mt-3 text-sm text-gray-300">Nenhuma votação aberta no momento.</p>
            ) : (
              <>
                <div className="mt-3 rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="text-sm text-gray-400">Título</div>
                  <div className="mt-1 text-base">{activePoll.title}</div>
                  {activePoll.description && (
                    <div className="mt-2 text-sm text-gray-300">{activePoll.description}</div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="text-sm text-gray-300">Adicionar opção</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Ex: Fé / Oração / Perseverança..."
                      className="w-full rounded-xl bg-black/40 px-4 py-3 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={onAddOption}
                      className="rounded-xl px-4 py-3 bg-white/10 ring-1 ring-white/10 hover:bg-white/15"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {options.length === 0 ? (
                    <p className="text-sm text-gray-300">Nenhuma opção criada ainda.</p>
                  ) : (
                    options.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between rounded-xl bg-black/30 p-3 ring-1 ring-white/10"
                      >
                        <div className="text-sm">{opt.text}</div>
                        <button
                          onClick={() => onDeleteOption(opt.id)}
                          className="text-xs rounded-lg px-2 py-1 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                        >
                          Apagar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
            <h2 className="text-lg font-semibold">Resultados</h2>

            {!activePoll ? (
              <p className="mt-3 text-sm text-gray-300">Abra uma votação para ver resultados.</p>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  {options.map((opt) => {
                    const votes = results[opt.id] ?? 0;
                    const pct = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);

                    return (
                      <div key={opt.id} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                        <div className="flex items-center justify-between text-sm">
                          <span>{opt.text}</span>
                          <span className="text-gray-300">
                            {votes} voto(s) • {pct}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-2 bg-amber-500/80" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  Total de votos: <span className="text-gray-200">{totalVotes}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

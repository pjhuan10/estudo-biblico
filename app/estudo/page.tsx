"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { hasAttendance, toggleAttendance } from "@/lib/attendance";
import { countAttendance, getNextOrLatestStudy, Study } from "@/lib/studies";

function formatDateBR(yyyyMmDd: string): string {
  // yyyy-mm-dd -> dd/mm/yyyy
  const [y, m, d] = yyyyMmDd.split("-");
  return `${d}/${m}/${y}`;
}

export default function EstudoDaSemana() {
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState<Study | null>(null);
  const [marked, setMarked] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [msg, setMsg] = useState<string | null>(null);

  const bibleTexts = useMemo(() => {
    const arr = study?.bible_texts ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [study]);

  async function loadAll() {
    setMsg(null);
    setLoading(true);

    try {
      const s = await getNextOrLatestStudy();
      setStudy(s);

      if (!s) {
        setMarked(false);
        setCount(0);
        return;
      }

      const [isMarked, total] = await Promise.all([
        hasAttendance(s.id),
        countAttendance(s.id),
      ]);

      setMarked(isMarked);
      setCount(total);
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao carregar estudo");
    } finally {
      setLoading(false);
    }
  }

  async function onToggle() {
    if (!study) return;

    setMsg(null);
    setLoading(true);

    try {
      const newMarked = await toggleAttendance(study.id);
      setMarked(newMarked);

      const total = await countAttendance(study.id);
      setCount(total);

      setMsg(newMarked ? "Presença marcada ✅" : "Presença removida ✅");
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao alterar presença");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadAll();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
        <div className="text-xs tracking-widest text-cyan-300/80">ESTUDO BÍBLICO</div>

        <h1 className="mt-2 text-2xl font-semibold">Estudo da semana</h1>

        <div className="mt-4 rounded-xl bg-black/30 ring-1 ring-white/10 p-4">
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : !study ? (
            <p className="text-gray-400">Nenhum estudo cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-gray-400">{formatDateBR(study.study_date)}</div>

              <div className="text-lg font-semibold text-cyan-200">{study.title}</div>

              {bibleTexts.length > 0 && (
                <div className="text-sm text-gray-200">
                  <span className="text-gray-400">Textos: </span>
                  {bibleTexts.join("; ")}
                </div>
              )}

              {study.summary && (
                <div className="text-sm text-gray-200">
                  <span className="text-gray-400">Resumo: </span>
                  {study.summary}
                </div>
              )}

              <div className="pt-2 text-sm text-gray-300">
                <span className="text-gray-400">Presenças marcadas: </span>
                <span className="text-cyan-300">{count}</span>
              </div>

              <div className="text-sm">
                {marked ? (
                  <span className="text-cyan-300">Você já marcou presença ✅</span>
                ) : (
                  <span className="text-gray-300">Você ainda não marcou presença.</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <Link
            href="/"
            className="flex-1 text-center rounded-xl px-4 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
          >
            Voltar
          </Link>

          <button
            onClick={onToggle}
            disabled={loading || !study}
            className="flex-1 text-center rounded-xl px-4 py-3 bg-cyan-500/20 ring-1 ring-cyan-300/30 hover:bg-cyan-500/30 disabled:opacity-50"
          >
            {marked ? "Desmarcar presença" : "Marcar presença"}
          </button>
        </div>

        {msg && <p className="mt-4 text-sm text-gray-300">{msg}</p>}
      </div>
    </main>
  );
}

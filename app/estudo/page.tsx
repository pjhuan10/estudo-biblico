"use client";

import { useEffect, useState } from "react";
import { markAttendance, hasAttendance } from "@/lib/attendance";

export default function EstudoDaSemana() {
  // por enquanto “fixo” só pra testar (depois a gente busca do banco)
  const studyId = "COLOQUE_AQUI_UM_UUID_DE_UM_STUDY";

  const [loading, setLoading] = useState(true);
  const [marked, setMarked] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);
    setLoading(true);
    try {
      const ok = await hasAttendance(studyId);
      setMarked(ok);
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao carregar presença");
    } finally {
      setLoading(false);
    }
  }

  async function onMark() {
    setMsg(null);
    try {
      await markAttendance(studyId);
      setMarked(true);
      setMsg("Presença marcada ✅");
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao marcar presença");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
        <h1 className="text-2xl font-semibold">Estudo da semana</h1>

        <div className="mt-4 rounded-xl bg-black/30 ring-1 ring-white/10 p-4">
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : marked ? (
            <p className="text-amber-300">Você já marcou presença ✅</p>
          ) : (
            <p className="text-gray-300">Você ainda não marcou presença.</p>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <a
            href="/"
            className="flex-1 text-center rounded-xl px-4 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
          >
            Voltar
          </a>

          <button
            onClick={onMark}
            disabled={loading || marked}
            className="flex-1 text-center rounded-xl px-4 py-3 bg-amber-500/20 ring-1 ring-amber-300/30 hover:bg-amber-500/30 disabled:opacity-50"
          >
            Marcar presença
          </button>
        </div>

        {msg && <p className="mt-4 text-sm text-gray-300">{msg}</p>}
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Study = {
  id: string;
  study_date: string;
  title: string;
  summary: string;
  bible_texts: string[]; // ARRAY no banco
};

export default function MesAMes() {
  const [items, setItems] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("studies")
      .select("id, study_date, title, summary, bible_texts")
      .order("study_date", { ascending: true });

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems((data ?? []) as Study[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="text-xs tracking-widest text-cyan-300/80">ESTUDO BÍBLICO</div>
        <h1 className="mt-2 text-3xl font-semibold">Mês a mês</h1>

        <div className="mt-6 rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
          {loading && <p className="text-gray-400">Carregando...</p>}

          {error && <p className="text-red-400">Erro: {error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="text-gray-400">Nenhum estudo cadastrado ainda.</p>
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((s) => (
                <li key={s.id} className="rounded-xl bg-black/30 ring-1 ring-white/10 p-4">
                  <div className="text-sm text-gray-400">{s.study_date}</div>
                  <div className="mt-1 text-lg font-semibold text-cyan-300">{s.title}</div>

                  <div className="mt-2 text-gray-200">
                    <span className="text-gray-400">Textos:</span>{" "}
                    {Array.isArray(s.bible_texts) ? s.bible_texts.join("; ") : ""}
                  </div>

                  <p className="mt-2 text-gray-300 leading-relaxed">{s.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <a
            href="/"
            className="inline-flex rounded-xl px-4 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
          >
            Voltar
          </a>
        </div>
      </div>
    </main>
  );
}

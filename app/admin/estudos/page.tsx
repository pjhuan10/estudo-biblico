"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isAdmin } from "@/lib/admin";
import { createStudy, deleteStudy, listStudies, updateStudy } from "@/lib/studiesAdmin";
import type { Study } from "@/lib/studies";

type FormState = {
  id?: string;
  study_date: string;
  title: string;
  bible_texts: string; // textarea (uma referência por linha ou separado por ;)
  summary: string;
};

function toInput(study: Study): FormState {
  const texts = Array.isArray(study.bible_texts) ? study.bible_texts : [];
  return {
    id: study.id,
    study_date: study.study_date,
    title: study.title,
    bible_texts: texts.join("; "),
    summary: study.summary ?? "",
  };
}

function toPayload(form: FormState): Omit<Study, "id"> {
  const raw = form.bible_texts
    .split(/[\n;]+/g)
    .map(s => s.trim())
    .filter(Boolean);

  return {
    study_date: form.study_date,
    title: form.title.trim(),
    summary: form.summary.trim() ? form.summary.trim() : null,
    bible_texts: raw,
  };
}

export default function AdminEstudosPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    study_date: "",
    title: "",
    bible_texts: "",
    summary: "",
  });

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  async function load() {
    setMsg(null);
    setLoading(true);
    try {
      const ok = await isAdmin();
      setAllowed(ok);

      if (!ok) return;

      const data = await listStudies(100);
      setItems(data);
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao carregar admin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit() {
    setMsg(null);
    setLoading(true);
    try {
      const payload = toPayload(form);

      if (!payload.study_date) throw new Error("Informe a data (YYYY-MM-DD).");
      if (!payload.title) throw new Error("Informe o título.");

      if (editing && form.id) {
        await updateStudy(form.id, payload);
        setMsg("Estudo atualizado ✅");
      } else {
        await createStudy(payload);
        setMsg("Estudo criado ✅");
      }

      setForm({ study_date: "", title: "", bible_texts: "", summary: "" });
      await load();
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao salvar");
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Apagar este estudo?")) return;

    setMsg(null);
    setLoading(true);
    try {
      await deleteStudy(id);
      setMsg("Estudo apagado ✅");
      await load();
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao apagar");
      setLoading(false);
    }
  }

  if (loading && allowed === null) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-400">Carregando...</p>
      </main>
    );
  }

  if (allowed === false) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
          <h1 className="text-xl font-semibold">Acesso negado</h1>
          <p className="mt-2 text-gray-300">Você não é administrador.</p>
          <div className="mt-5">
            <Link
              href="/"
              className="inline-block rounded-xl px-4 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
            >
              Voltar
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest text-amber-300/80">ADMIN</div>
            <h1 className="mt-1 text-2xl font-semibold">Estudos</h1>
          </div>

          <Link
            href="/"
            className="rounded-xl px-4 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
          >
            Voltar
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
            <h2 className="text-lg font-semibold">{editing ? "Editar estudo" : "Novo estudo"}</h2>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm text-gray-300">Data (YYYY-MM-DD)</span>
                <input
                  value={form.study_date}
                  onChange={(e) => setForm((s) => ({ ...s, study_date: e.target.value }))}
                  className="rounded-xl bg-black/30 ring-1 ring-white/10 px-3 py-2 outline-none"
                  placeholder="2026-02-26"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-gray-300">Título</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  className="rounded-xl bg-black/30 ring-1 ring-white/10 px-3 py-2 outline-none"
                  placeholder="Fé em meio à ansiedade"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-gray-300">Textos (separe por ; ou por linha)</span>
                <textarea
                  value={form.bible_texts}
                  onChange={(e) => setForm((s) => ({ ...s, bible_texts: e.target.value }))}
                  className="min-h-[90px] rounded-xl bg-black/30 ring-1 ring-white/10 px-3 py-2 outline-none"
                  placeholder="Mateus 6:25-34; Filipenses 4:6-7"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-gray-300">Resumo</span>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm((s) => ({ ...s, summary: e.target.value }))}
                  className="min-h-[90px] rounded-xl bg-black/30 ring-1 ring-white/10 px-3 py-2 outline-none"
                  placeholder="Confiança em Deus e prática da oração."
                />
              </label>

              <div className="flex gap-3">
                <button
                  onClick={onSubmit}
                  disabled={loading}
                  className="flex-1 rounded-xl px-4 py-3 bg-amber-500/20 ring-1 ring-amber-300/30 hover:bg-amber-500/30 disabled:opacity-50"
                >
                  {editing ? "Salvar alterações" : "Criar estudo"}
                </button>

                {editing && (
                  <button
                    onClick={() => setForm({ study_date: "", title: "", bible_texts: "", summary: "" })}
                    className="rounded-xl px-4 py-3 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {msg && <p className="text-sm text-gray-300">{msg}</p>}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
            <h2 className="text-lg font-semibold">Lista</h2>

            <div className="mt-4 grid gap-3">
              {items.length === 0 ? (
                <p className="text-gray-400">Nenhum estudo cadastrado.</p>
              ) : (
                items.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl bg-black/30 ring-1 ring-white/10 p-4"
                  >
                    <div className="text-xs text-gray-400">{s.study_date}</div>
                    <div className="mt-1 font-semibold text-amber-200">{s.title}</div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setForm(toInput(s))}
                        className="flex-1 rounded-xl px-3 py-2 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => onDelete(s.id)}
                        className="rounded-xl px-3 py-2 bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          Dica: coloque um link para esta página só para admin no menu depois: <span className="text-gray-200">/admin/estudos</span>
        </div>
      </div>
    </main>
  );
}

import { supabase } from "@/lib/supabase";

export type Study = {
  id: string;
  study_date: string; // YYYY-MM-DD
  title: string;
  summary?: string | null;
  bible_texts?: string[] | null;
};

export async function getNextOrLatestStudy(): Promise<Study | null> {
  // 1) tenta pegar o próximo estudo (>= hoje)
  const today = new Date().toISOString().slice(0, 10);

  const next = await supabase
    .from("studies")
    .select("id, study_date, title, summary, bible_texts")
    .gte("study_date", today)
    .order("study_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (next.error) throw next.error;
  if (next.data) return next.data as Study;

  // 2) se não tiver próximo, pega o mais recente (passado)
  const latest = await supabase
    .from("studies")
    .select("id, study_date, title, summary, bible_texts")
    .order("study_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest.error) throw latest.error;
  return (latest.data as Study) ?? null;
}

export async function countAttendance(studyId: string): Promise<number> {
  // head: true evita trazer linhas, só conta
  const { count, error } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("study_id", studyId);

  if (error) throw error;
  return count ?? 0;
}

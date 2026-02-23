import { supabase } from "@/lib/supabase";
import type { Study } from "@/lib/studies";

export async function listStudies(limit = 50): Promise<Study[]> {
  const { data, error } = await supabase
    .from("studies")
    .select("id, study_date, title, summary, bible_texts")
    .order("study_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Study[]) ?? [];
}

export async function createStudy(input: Omit<Study, "id">): Promise<void> {
  const { error } = await supabase.from("studies").insert({
    study_date: input.study_date,
    title: input.title,
    summary: input.summary ?? null,
    bible_texts: input.bible_texts ?? [],
  });

  if (error) throw error;
}

export async function updateStudy(id: string, input: Omit<Study, "id">): Promise<void> {
  const { error } = await supabase
    .from("studies")
    .update({
      study_date: input.study_date,
      title: input.title,
      summary: input.summary ?? null,
      bible_texts: input.bible_texts ?? [],
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteStudy(id: string): Promise<void> {
  const { error } = await supabase.from("studies").delete().eq("id", id);
  if (error) throw error;
}

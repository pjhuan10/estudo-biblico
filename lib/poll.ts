import { supabase } from "@/lib/supabase";

export type Poll = {
  id: string;
  title: string;
  is_open: boolean;
  created_at: string;
};

export type PollOption = {
  id: string;
  poll_id: string;
  label: string;
};

export async function getOpenPoll(): Promise<Poll | null> {
  const { data, error } = await supabase
    .from("polls")
    .select("id, title, is_open, created_at")
    .eq("is_open", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as Poll) ?? null;
}

export async function getPollOptions(pollId: string): Promise<PollOption[]> {
  const { data, error } = await supabase
    .from("poll_options")
    .select("id, poll_id, label")
    .eq("poll_id", pollId)
    .order("label", { ascending: true });

  if (error) throw error;
  return (data as PollOption[]) ?? [];
}

export async function getMyVote(pollId: string): Promise<string | null> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData.user;
  if (!user) return null;

  // OBS: poll_votes select está admin-only no seu SQL.
  // Então aqui a gente não lê poll_votes diretamente.
  // A forma simples: tenta inserir e, se já existir, considera "já votou".
  // Mas pra UX boa, vamos guardar localmente no browser.
  // Você pode trocar por RPC/view depois.
  const key = `poll_vote_${pollId}_${user.id}`;
  return localStorage.getItem(key);
}

export async function vote(pollId: string, optionId: string): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData.user;
  if (!user) throw new Error("Você precisa estar logado para votar.");

  const { error } = await supabase.from("poll_votes").insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: user.id,
  });

  // se já votou, Postgres vai acusar unique violation
  if (error) {
    // 23505 = unique_violation
    // Supabase pode devolver string diferente, então mantém fallback
    if ((error as any).code === "23505") {
      throw new Error("Você já votou nesta enquete.");
    }
    throw error;
  }

  // marca no browser (UX)
  const key = `poll_vote_${pollId}_${user.id}`;
  localStorage.setItem(key, optionId);
}

export async function getPollResults(pollId: string): Promise<Record<string, number>> {
  // como poll_votes select está admin-only, resultado precisa vir via RPC/view.
  // solução simples (sem expor user_id): criar um VIEW público de contagem.
  // Por enquanto, vamos tentar ler de uma view "poll_results" (vamos criar no SQL abaixo).
  const { data, error } = await supabase
    .from("poll_results")
    .select("option_id, votes")
    .eq("poll_id", pollId);

  if (error) throw error;

  const map: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    map[row.option_id] = row.votes;
  });

  return map;
}

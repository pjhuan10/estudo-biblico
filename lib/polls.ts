import { supabase } from "@/lib/supabase";

export type Poll = {
  id: string;
  title: string;
  description: string | null;
  is_open: boolean;
  closes_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type PollOption = {
  id: string;
  poll_id: string;
  text: string;
  created_at: string;
};

export async function getOpenPoll(): Promise<(Poll & { options: PollOption[] }) | null> {
  const { data: poll, error } = await supabase
    .from("polls")
    .select("id, title, description, is_open, closes_at, created_by, created_at")
    .eq("is_open", true)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (error) throw error;
  if (!poll) return null;

  const { data: options, error: optErr } = await supabase
    .from("poll_options")
    .select("id, poll_id, text, created_at")
    .eq("poll_id", poll.id)
    .order("created_at", { ascending: true });

  if (optErr) throw optErr;

  return {
    ...(poll as Poll),
    options: (options as PollOption[]) ?? [],
  };
}

export async function getMyVoteOptionId(pollId: string): Promise<string | null> {
  // tenta cache primeiro (UX)
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (user) {
    const key = `poll_vote_${pollId}_${user.id}`;
    const cached = localStorage.getItem(key);
    if (cached) return cached;
  }

  // tenta ler do banco (se RLS permitir select do próprio voto)
  const { data: u, error: uErr } = await supabase.auth.getUser();
  if (uErr) throw uErr;
  if (!u.user) return null;

  const { data, error } = await supabase
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("user_id", u.user.id)
    .maybeSingle();

  if (error) {
    // se policy bloquear select, fica no cache
    return null;
  }

  return (data as any)?.option_id ?? null;
}

export async function vote(pollId: string, optionId: string): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData.user;
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase.from("poll_votes").insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: user.id,
  });

  if (error) throw error;

  const key = `poll_vote_${pollId}_${user.id}`;
  localStorage.setItem(key, optionId);
}

export async function getPollResults(pollId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.rpc("get_poll_results", { p_poll_id: pollId });
  if (error) throw error;

  const map: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    map[row.option_id] = row.votes;
  });

  return map;
}

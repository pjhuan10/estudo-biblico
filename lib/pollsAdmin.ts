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

export async function getActivePoll(): Promise<Poll | null> {
  const { data, error } = await supabase
    .from("polls")
    .select("id, title, description, is_open, closes_at, created_by, created_at")
    .eq("is_open", true)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (error) throw error;
  return (data as Poll) ?? null;
}

export async function closeOpenPolls(): Promise<void> {
  const { error } = await supabase.from("polls").update({ is_open: false }).eq("is_open", true);
  if (error) throw error;
}

export async function closePoll(pollId: string): Promise<void> {
  const { error } = await supabase
    .from("polls")
    .update({ is_open: false, closes_at: new Date().toISOString() })
    .eq("id", pollId);

  if (error) throw error;
}

export async function createPoll(title: string, description?: string | null): Promise<Poll> {
  await closeOpenPolls();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData.user;
  if (!user) throw new Error("Usuário não autenticado");

  const payload = {
    title: title.trim(),
    description: description?.trim() ? description!.trim() : null,
    is_open: true,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("polls")
    .insert(payload)
    .select("id, title, description, is_open, closes_at, created_by, created_at")
    .single();

  if (error) throw error;
  return data as Poll;
}

export async function deletePoll(pollId: string): Promise<void> {
  const { error } = await supabase.from("polls").delete().eq("id", pollId);
  if (error) throw error;
}

export async function listOptions(pollId: string): Promise<PollOption[]> {
  const { data, error } = await supabase
    .from("poll_options")
    .select("id, poll_id, text, created_at")
    .eq("poll_id", pollId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as PollOption[]) ?? [];
}

export async function addOption(pollId: string, text: string): Promise<void> {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return;

  const { error } = await supabase.from("poll_options").insert({ poll_id: pollId, text: trimmed });
  if (error) throw error;
}

export async function deleteOption(optionId: string): Promise<void> {
  const { error } = await supabase.from("poll_options").delete().eq("id", optionId);
  if (error) throw error;
}

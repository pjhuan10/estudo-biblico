import { supabase } from "@/lib/supabase";
import type { Poll, PollOption } from "@/lib/poll";

export async function listPolls(limit = 20): Promise<Poll[]> {
  const { data, error } = await supabase
    .from("polls")
    .select("id, title, is_open, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Poll[]) ?? [];
}

export async function createPoll(title: string): Promise<Poll> {
  const { data, error } = await supabase
    .from("polls")
    .insert({ title, is_open: true })
    .select("id, title, is_open, created_at")
    .single();

  if (error) throw error;
  return data as Poll;
}

export async function setPollOpen(pollId: string, isOpen: boolean): Promise<void> {
  const { error } = await supabase.from("polls").update({ is_open: isOpen }).eq("id", pollId);
  if (error) throw error;
}

export async function deletePoll(pollId: string): Promise<void> {
  const { error } = await supabase.from("polls").delete().eq("id", pollId);
  if (error) throw error;
}

export async function listOptions(pollId: string): Promise<PollOption[]> {
  const { data, error } = await supabase
    .from("poll_options")
    .select("id, poll_id, label")
    .eq("poll_id", pollId)
    .order("label", { ascending: true });

  if (error) throw error;
  return (data as PollOption[]) ?? [];
}

export async function addOption(pollId: string, label: string): Promise<void> {
  const { error } = await supabase.from("poll_options").insert({ poll_id: pollId, label });
  if (error) throw error;
}

export async function deleteOption(optionId: string): Promise<void> {
  const { error } = await supabase.from("poll_options").delete().eq("id", optionId);
  if (error) throw error;
}

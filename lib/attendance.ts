import { supabase } from "@/lib/supabase";

export async function hasAttendance(studyId: string): Promise<boolean> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData.user;
  if (!user) return false;

  const { data, error } = await supabase
    .from("attendance")
    .select("id")
    .eq("study_id", studyId)
    .eq("user_id", user.id)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function markAttendance(studyId: string): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData.user;
  if (!user) throw new Error("Você precisa estar logado.");

  const { error } = await supabase.from("attendance").insert({
    study_id: studyId,
    user_id: user.id,
  });

  if (error) throw error;
}

export async function unmarkAttendance(studyId: string): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userData.user;
  if (!user) throw new Error("Você precisa estar logado.");

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("study_id", studyId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function toggleAttendance(studyId: string): Promise<boolean> {
  const marked = await hasAttendance(studyId);
  if (marked) {
    await unmarkAttendance(studyId);
    return false;
  }
  await markAttendance(studyId);
  return true;
}

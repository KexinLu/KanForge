"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createTrainingRun(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const triggerWord = formData.get("trigger_word") as string;

  if (!name?.trim() || !triggerWord?.trim()) {
    throw new Error("Name and trigger word are required");
  }

  const { data, error } = await supabase
    .from("training_runs")
    .insert({
      profile_id: user.id,
      name: name.trim(),
      trigger_word: triggerWord.trim(),
      type: "style",
      status: "draft",
      config: {
        lora_rank: 16,
        lora_alpha: 16,
        learning_rate: 1e-4,
        steps: 3000,
        resolution: 1024,
      },
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/training/${data.id}`);
}

import { Shell } from "@/components/app-shell";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: runs } = await supabase
    .from("training_runs")
    .select("id, name, status")
    .order("created_at", { ascending: false });

  return (
    <Shell navbar={<Sidebar runs={runs ?? []} />}>
      {children}
    </Shell>
  );
}

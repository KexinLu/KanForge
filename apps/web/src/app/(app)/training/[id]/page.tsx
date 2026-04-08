import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Badge,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ImageUploader } from "@/components/image-uploader";
import { ImageGallery } from "@/components/image-gallery";

const statusColors: Record<string, string> = {
  draft: "gray",
  processing: "blue",
  training: "violet",
  completed: "green",
  failed: "red",
};

export default async function TrainingRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: run } = await supabase
    .from("training_runs")
    .select("*")
    .eq("id", id)
    .single();

  if (!run) notFound();

  const { data: images } = await supabase
    .from("training_images")
    .select("id, original_filename, storage_path, rejected")
    .eq("training_run_id", id)
    .order("created_at", { ascending: true });

  const activeCount = images?.filter((i) => !i.rejected).length ?? 0;

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>{run.name}</Title>
          <Text c="dimmed" size="sm">
            Trigger: {run.trigger_word}
          </Text>
        </div>
        <Badge
          color={statusColors[run.status] ?? "gray"}
          variant="light"
          size="lg"
        >
          {run.status}
        </Badge>
      </Group>

      <Stack gap="lg">
        <ImageUploader trainingRunId={run.id} />

        {images && images.length > 0 && (
          <div>
            <Text fw={600} mb="sm">
              Images ({activeCount} active, {images.length} total)
            </Text>
            <ImageGallery images={images} />
          </div>
        )}
      </Stack>
    </Container>
  );
}

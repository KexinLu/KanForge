import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";

interface TrainingRun {
  id: string;
  name: string;
  type: string;
  status: string;
  trigger_word: string;
  current_stage: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: "gray",
  processing: "blue",
  training: "violet",
  completed: "green",
  failed: "red",
};

function TrainingRunCard({ run }: { run: TrainingRun }) {
  return (
    <Card withBorder shadow="sm" radius="md" padding="lg">
      <Group justify="space-between" mb="xs">
        <Text fw={600} truncate>
          {run.name}
        </Text>
        <Badge color={statusColors[run.status] ?? "gray"} variant="light">
          {run.status}
        </Badge>
      </Group>
      <Text size="sm" c="dimmed" mb="xs">
        {run.trigger_word}
      </Text>
      {run.current_stage && (
        <Text size="xs" c="dimmed">
          Stage: {run.current_stage}
        </Text>
      )}
      <Text size="xs" c="dimmed" mt="sm">
        {new Date(run.created_at).toLocaleDateString()}
      </Text>
    </Card>
  );
}

function EmptyState() {
  return (
    <Stack align="center" gap="lg" mt={80}>
      <Title order={2}>No training runs yet</Title>
      <Text c="dimmed" size="lg" ta="center" maw={400}>
        Create your first style LoRA by uploading reference images and letting
        KanForge handle the rest.
      </Text>
      <Button size="lg">New Style Training</Button>
    </Stack>
  );
}

async function TrainingRunList() {
  const supabase = await createClient();
  const { data: runs } = await supabase
    .from("training_runs")
    .select("id, name, type, status, trigger_word, current_stage, created_at")
    .order("created_at", { ascending: false });

  if (!runs || runs.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Training Runs</Title>
        <Button>New Style Training</Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {runs.map((run) => (
          <TrainingRunCard key={run.id} run={run} />
        ))}
      </SimpleGrid>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Skeleton height={32} width={200} />
        <Skeleton height={36} width={160} />
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={140} radius="md" />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export default function DashboardPage() {
  return (
    <Container size="lg">
      <Suspense fallback={<LoadingSkeleton />}>
        <TrainingRunList />
      </Suspense>
    </Container>
  );
}

"use client";

import { Button, NavLink, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

interface TrainingRunSummary {
  id: string;
  name: string;
  status: string;
}

export function Sidebar({ runs }: { runs: TrainingRunSummary[] }) {
  const router = useRouter();

  return (
    <Stack gap="sm" h="100%">
      <Button fullWidth onClick={() => router.push("/training/new")}>
        New Style Training
      </Button>

      {runs.length > 0 && (
        <Stack gap={4} mt="sm">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase">
            Training Runs
          </Text>
          {runs.map((run) => (
            <NavLink
              key={run.id}
              label={run.name}
              description={run.status}
              onClick={() => router.push(`/training/${run.id}`)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

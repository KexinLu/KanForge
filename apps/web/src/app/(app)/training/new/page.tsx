"use client";

import {
  Button,
  Container,
  Paper,
  Stack,
  TextInput,
  Title,
  Text,
} from "@mantine/core";
import { createTrainingRun } from "../actions";
import { useActionState } from "react";

function formAction(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  return createTrainingRun(formData).then(
    () => ({ error: null }),
    (e) => ({ error: e.message })
  );
}

export default function NewTrainingPage() {
  const [state, action, pending] = useActionState(formAction, { error: null });

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">
        New Style Training
      </Title>

      <Paper withBorder p="lg" radius="md">
        <form action={action}>
          <Stack gap="md">
            {state.error && (
              <Text c="red" size="sm">
                {state.error}
              </Text>
            )}

            <TextInput
              label="Name"
              name="name"
              placeholder="e.g. UE5 Mech Style"
              required
            />

            <TextInput
              label="Trigger word"
              name="trigger_word"
              placeholder="e.g. mechStyle"
              description="A unique word that activates your LoRA during generation"
              required
            />

            <Button type="submit" loading={pending}>
              Create Training Run
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

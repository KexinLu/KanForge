import { Container, Title, Text, Button, Stack, Group } from "@mantine/core";

export default function Home() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg" mt={80}>
        <Title order={1}>KanForge</Title>
        <Text c="dimmed" size="lg" ta="center">
          One-click LoRA training for ZImage Turbo. Upload images, auto-caption,
          train on cloud GPU, generate, download your LoRA.
        </Text>
        <Group>
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

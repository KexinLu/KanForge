import { Container, Group, Title, Text, Stack, Button } from "@mantine/core";
import { UserMenu } from "@/components/user-menu";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Group justify="space-between" px="md" py="sm">
        <Title order={3}>KanForge</Title>
        <UserMenu />
      </Group>
      <Container size="sm" py="xl">
        <Stack align="center" gap="lg" mt={40}>
          <Title order={1}>Dashboard</Title>
          <Text c="dimmed" size="lg" ta="center">
            Upload images, train a LoRA, generate with ZImage Turbo.
          </Text>
          <Button size="lg">New Training Job</Button>
        </Stack>
      </Container>
    </>
  );
}

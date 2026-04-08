import { Box, Group, Title } from "@mantine/core";
import { UserMenu } from "@/components/user-menu";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Box
        component="header"
        h={56}
        px="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Group justify="space-between" h="100%" wrap="nowrap">
          <Title order={3}>KanForge</Title>
          <UserMenu />
        </Group>
      </Box>
      <Box component="main" p="md">
        {children}
      </Box>
    </>
  );
}

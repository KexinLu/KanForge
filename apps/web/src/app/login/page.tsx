"use client";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    setLoading(true);
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError(error.message);
        setLoading(false);
        // Strip stale code from URL to prevent retry loop
        router.replace("/login");
      } else {
        router.push("/");
      }
    });
  }, [searchParams, router]);

  const handleOAuth = async () => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Stack gap="sm">
        {error && (
          <Text c="red" size="sm" ta="center">
            {error}
          </Text>
        )}
        <Button
          variant="default"
          size="md"
          fullWidth
          onClick={handleOAuth}
          loading={loading}
        >
          Continue with Google
        </Button>
      </Stack>

      <Divider my="md" />

      <Text c="dimmed" size="xs" ta="center">
        By continuing, you agree to our Terms of Service.
      </Text>
    </Paper>
  );
}

export default function LoginPage() {
  return (
    <Container size={420} py={80}>
      <Title ta="center" order={1}>
        KanForge
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="sm">
        One-click LoRA training for ZImage Turbo
      </Text>

      <Suspense>
        <LoginForm />
      </Suspense>
    </Container>
  );
}

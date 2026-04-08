"use client";

import { createClient } from "@/lib/supabase/client";
import { Avatar, Menu, UnstyledButton } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

export function UserMenu() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
    }
    load();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.display_name ?? "User"}
            radius="xl"
            size="sm"
          />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{profile?.display_name ?? "User"}</Menu.Label>
        <Menu.Divider />
        <Menu.Item onClick={handleSignOut}>Sign out</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import {
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  ActionIcon,
  Progress,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface UploadedImage {
  id: string;
  original_filename: string;
  storage_path: string;
  url: string;
}

export function ImageUploader({ trainingRunId }: { trainingRunId: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const router = useRouter();

  const handleDrop = useCallback(
    async (files: File[]) => {
      setUploading(true);
      setProgress(0);

      const supabase = createClient();
      const uploaded: UploadedImage[] = [];
      let completed = 0;

      for (const file of files) {
        const imageId = crypto.randomUUID();
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
        const storagePath = `${trainingRunId}/${imageId}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("training-assets")
          .upload(storagePath, file);

        if (uploadError) {
          notifications.show({
            title: "Upload failed",
            message: `${file.name}: ${uploadError.message}`,
            color: "red",
          });
          completed++;
          setProgress(Math.round((completed / files.length) * 100));
          continue;
        }

        // Create image record
        const { data: imageRecord, error: dbError } = await supabase
          .from("training_images")
          .insert({
            id: imageId,
            training_run_id: trainingRunId,
            original_filename: file.name,
            storage_path: storagePath,
          })
          .select("id, original_filename, storage_path")
          .single();

        if (dbError) {
          notifications.show({
            title: "Record failed",
            message: `${file.name}: ${dbError.message}`,
            color: "red",
          });
        } else if (imageRecord) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("training-assets")
            .getPublicUrl(storagePath);

          uploaded.push({ ...imageRecord, url: publicUrl });
        }

        completed++;
        setProgress(Math.round((completed / files.length) * 100));
      }

      setImages((prev) => [...prev, ...uploaded]);
      setUploading(false);
      setProgress(0);
      router.refresh();
    },
    [trainingRunId, router]
  );

  return (
    <Stack gap="md">
      <Dropzone
        onDrop={handleDrop}
        accept={IMAGE_MIME_TYPE}
        loading={uploading}
        multiple
      >
        <Group
          justify="center"
          gap="xl"
          mih={160}
          style={{ pointerEvents: "none" }}
        >
          <Stack align="center" gap="xs">
            <Text size="xl" fw={600} inline>
              Drop images here
            </Text>
            <Text size="sm" c="dimmed" inline>
              PNG, JPG, WebP — up to 50MB each
            </Text>
          </Stack>
        </Group>
      </Dropzone>

      {uploading && <Progress value={progress} animated />}
    </Stack>
  );
}

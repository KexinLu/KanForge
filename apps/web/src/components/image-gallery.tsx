"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ActionIcon,
  Box,
  Group,
  Image,
  Modal,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TrainingImage {
  id: string;
  original_filename: string;
  storage_path: string;
  rejected: boolean;
}

export function ImageGallery({ images }: { images: TrainingImage[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [opened, { open, close }] = useDisclosure(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex];

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    open();
  };

  const goNext = () =>
    setActiveIndex((i) => (i + 1) % images.length);
  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    async function loadUrls() {
      const paths = images.map((i) => i.storage_path);
      const { data } = await supabase.storage
        .from("training-assets")
        .createSignedUrls(paths, 3600);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item) => {
          if (item.signedUrl) {
            map[item.path!] = item.signedUrl;
          }
        });
        setUrls(map);
      }
    }
    if (images.length > 0) loadUrls();
  }, [images, supabase]);

  const deleteImage = async (image: TrainingImage) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("training-assets")
      .remove([image.storage_path]);

    if (storageError) {
      notifications.show({
        title: "Delete failed",
        message: storageError.message,
        color: "red",
      });
      return;
    }

    // Delete from DB
    const { error: dbError } = await supabase
      .from("training_images")
      .delete()
      .eq("id", image.id);

    if (dbError) {
      notifications.show({
        title: "Delete failed",
        message: dbError.message,
        color: "red",
      });
      return;
    }

    // If lightbox is open on this image, close it
    if (opened && activeImage?.id === image.id) {
      close();
    }

    router.refresh();
  };

  if (images.length === 0) return null;

  return (
    <>
      <Box
        style={{
          columns: "200px auto",
          gap: "8px",
        }}
      >
        {images.map((image, index) => (
          <Box
            key={image.id}
            style={{
              breakInside: "avoid",
              marginBottom: "8px",
              position: "relative",
              borderRadius: "var(--mantine-radius-md)",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <Image
              src={urls[image.storage_path]}
              alt={image.original_filename}
              radius="md"
              onClick={() => openLightbox(index)}
            />
            <Tooltip label="Delete">
              <ActionIcon
                variant="filled"
                color="red"
                size="sm"
                radius="xl"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(image);
                }}
              >
                ×
              </ActionIcon>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        centered
        withCloseButton={false}
        padding={0}
        radius="md"
        overlayProps={{ backgroundOpacity: 0.7, blur: 2 }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goNext();
          if (e.key === "ArrowLeft") goPrev();
        }}
      >
        {activeImage && (
          <Box pos="relative">
            <Image
              src={urls[activeImage.storage_path]}
              alt={activeImage.original_filename}
              fit="contain"
              mah="80vh"
            />
            <Group
              justify="space-between"
              pos="absolute"
              top={0}
              left={0}
              right={0}
              p="xs"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <Text c="white" size="sm" fw={500}>
                {activeImage.original_filename}
              </Text>
              <Text c="white" size="xs">
                {activeIndex + 1} / {images.length}
              </Text>
            </Group>

            <ActionIcon
              variant="filled"
              color="dark"
              radius="xl"
              size="lg"
              pos="absolute"
              top="50%"
              left={8}
              style={{ transform: "translateY(-50%)" }}
              onClick={goPrev}
            >
              ‹
            </ActionIcon>
            <ActionIcon
              variant="filled"
              color="dark"
              radius="xl"
              size="lg"
              pos="absolute"
              top="50%"
              right={8}
              style={{ transform: "translateY(-50%)" }}
              onClick={goNext}
            >
              ›
            </ActionIcon>
          </Box>
        )}
      </Modal>
    </>
  );
}

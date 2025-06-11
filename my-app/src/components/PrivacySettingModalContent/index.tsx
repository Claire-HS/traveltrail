"use client";

import { useEffect, useState } from "react";
import { Button, Group, Text, Stack } from "@mantine/core";

interface Props {
  settingData?: {
    id: string;
    isPublic: boolean;
  };
  currentIsPublic: boolean;
  isLoading: boolean;
  onPrivacyChange: (id: string, currentIsPublic: boolean) => void;
  onClose: () => void;
}

export default function PrivacySettingModalContent({
  settingData,
  currentIsPublic,
  isLoading,
  onPrivacyChange,
  onClose,
}: Props) {
  const [isPublic, setIsPublic] = useState(currentIsPublic);

  useEffect(() => {
    setIsPublic(currentIsPublic);
  }, [currentIsPublic]);

  if (!settingData) return null;

  const handleToggle = () => {
    onPrivacyChange(settingData.id, isPublic);
  };

  return (
    <div className="flex flex-col gap-4">
      <Text size="sm" c="dimmed">
        選擇公開的行程會對所有人可見。
      </Text>
      <Text size="md" ta="center">
        目前狀態：{" "}
        <strong className={currentIsPublic ? "text-red-600" : "text-gray-600"}>
          {currentIsPublic ? "公開" : "私人"}
        </strong>
      </Text>
      <Group justify="center" mt="xs">
        <Stack align="center" gap="xl">
          <Button
            color={currentIsPublic ? "#2C3E50" : "red"}
            variant="filled"
            radius="xl"
            onClick={handleToggle}
            loading={isLoading}
            fullWidth
          >
            切換為 {currentIsPublic ? "私人" : "公開"}
          </Button>
          <Button variant="default" onClick={onClose} fullWidth>
            關閉
          </Button>
        </Stack>
      </Group>
    </div>
  );
}

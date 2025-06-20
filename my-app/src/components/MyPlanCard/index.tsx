"use client";

import {
  Card,
  CardSection,
  Image,
  Text,
  Group,
  ActionIcon,
  Flex,
  Button,
  Box,
  Menu,
} from "@mantine/core";
import {
  IconCircleX,
  IconFilePencil,
  IconEyeQuestion,
  IconUsersPlus,
  IconEyeOff,
} from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";

interface CustomCardProps {
  planId: string;
  imageSrc: string;
  title: string;
  travelDate: string;
  note: string | null;
  route: string;
  isPublic?: boolean;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onPrivacyClick?: () => void;
}

export default function MyPlanCard({
  planId,
  imageSrc,
  title,
  travelDate,
  note,
  route,
  isPublic,
  onDeleteClick,
  onEditClick,
  onPrivacyClick,
}: CustomCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const showActions = pathname.startsWith("/myplans");

  return (
    <Card
      w={300}
      h={300}
      bg="#FDFCF9"
      shadow="sm"
      padding="md"
      radius="lg"
      onClick={() => router.push(route)}
      className="border border-transparent transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:border-[#2C3E50] cursor-pointer"
    >
      <Flex direction="column" h="100%">
        <CardSection className="relative">
          <Image src={imageSrc} h={160} alt="planPic" />
          {showActions && !isPublic && (
            <div className="absolute top-2 left-2 z-10 text-gray-500">
              <IconEyeOff size={25} />
            </div>
          )}

          {showActions && (
            <Group className="absolute top-2 right-2 z-10">
              <ActionIcon
                color="#2C3E50"
                variant="transparent"
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick?.();
                }}
              >
                <IconCircleX size={25} />
              </ActionIcon>
            </Group>
          )}
        </CardSection>

        <Text fw={500} size="lg" mt="xs" ta="center" lineClamp={1}>
          {title}
        </Text>
        <Text c="dimmed" size="md" ta="center">
          {travelDate}
        </Text>

        <Box h={24} mt={2}>
          <Text c="dimmed" size="sm" ta="center" lineClamp={1}>
            {note || ""}
          </Text>
        </Box>

        {showActions && (
          <Flex
            justify="space-between"
            mt="auto"
            gap="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Menu
              shadow="md"
              width={150}
              position="bottom-start"
              offset={6}
              withArrow
            >
              <Menu.Target>
                <Button
                  size="xs"
                  fullWidth
                  variant="outline"
                  color="#2C3E50"
                  className="hover:bg-red-600 transition"
                >
                  行程設定
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconFilePencil size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick?.();
                  }}
                >
                  修改資訊
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEyeQuestion size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrivacyClick?.();
                  }}
                >
                  隱私設定
                </Menu.Item>
                {/* <Menu.Item leftSection={<IconUsersPlus size={14} />}>
                  共同編輯-尚未完成
                </Menu.Item> */}
              </Menu.Dropdown>
            </Menu>

            {/* <Button
              size="xs"
              fullWidth
              variant="outline"
              color="#2C3E50"
              disabled
            >
              記帳
            </Button> */}
            <Button
              size="xs"
              fullWidth
              variant="outline"
              color="#2C3E50"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/planning?id=${planId}`);
              }}
            >
              編輯行程
            </Button>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

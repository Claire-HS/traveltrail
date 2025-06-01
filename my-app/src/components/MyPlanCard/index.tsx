"use client";

import { Card, CardSection, Image, Text, Avatar } from "@mantine/core";
import { useRouter } from "next/navigation";

interface CustomCardProps {
  imageSrc: string;
  title: string;
  travelDate: string;
  note: string | null;
  route: string;
}

export default function MyPlanCard({
  imageSrc,
  title,
  travelDate,
  note,
  route,
}: CustomCardProps) {
  const router = useRouter();

  return (
    <Card
      w={300}
      h={300}
      bg="#FDFCF9"
      shadow="sm"
      padding="md"
      radius="lg"
      onClick={() => router.push(route)}
    >
      <CardSection>
        <Image src={imageSrc} h={160} alt="planPic" />
      </CardSection>

      <Text
        fw={500}
        size="lg"
        mt="xs"
        ta="center"
        lineClamp={2}
        className="w-full"
      >
        {title}
      </Text>
      <Text c="dimmed" size="md" ta="center">
        {travelDate}
      </Text>
      <Text c="dimmed" size="md" ta="center" lineClamp={1}>
        {note}
      </Text>
    </Card>
  );
}

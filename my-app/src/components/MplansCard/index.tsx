"use client";

import { Card, CardSection, Image, Text, Avatar, Group } from "@mantine/core";
import { useRouter } from "next/navigation";

interface CustomCardProps {
  imageSrc: string;
  title: string;
  travelDate: string;
  member: string;
  route: string;
}

export default function MplansCard({
  imageSrc,
  title,
  travelDate,
  member,
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
        lineClamp={2}
        className="text-wrap truncate w-full"
      >
        {title}
      </Text>
      <Text c="dimmed" size="md" ta="center">
        {travelDate}
      </Text>
      <div className="flex justify-center items-center mt-2">
        <Avatar size="sm" variant="filled" radius="xl" color="#8C6E63" mx={8} />
        <Text c="dimmed" size="md">
          {member}
        </Text>
      </div>
    </Card>
    
  );
}

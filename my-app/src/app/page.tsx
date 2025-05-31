"use client";
import { Box, SimpleGrid, Text, Button, Group, Collapse } from "@mantine/core";
import { IconMapSearch, IconSearch, IconHandClick } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import MplansCard from "@/components/MplansCard";
import { useDisclosure } from "@mantine/hooks";

export default function Home() {
  // const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <>
      <div className="w-full h-96 border-b border-black flex justify-center relative">
        <div className="w-96 absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 ">
          <SearchInput
            placeholder="Where to go?"
            leftSection={<IconMapSearch color="#8C6E63" size={32} />}
          />
        </div>
      </div>
      <div className="px-10 mt-5 relative flex flex-col">
        <div className="text-4xl font-bold flex items-center text-foreground">
          行程靈感
        </div>
        <div className="w-96 absolute top-10 left-1/2 transform -translate-x-1/2">
          <SearchInput
            placeholder="看看其他人怎麼玩 👀?"
            leftSection={<IconSearch color="#8C6E63" size={32} />}
          />
        </div>
        <div className="w-full pb-15 flex flex-col justify-center items-center">
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 4 }}
            spacing={{ base: 10, sm: 40 }}
            verticalSpacing={{ base: "md", sm: "xl" }}
            className="mt-20"
          >
            <MplansCard
              imageSrc="/iceland.jpeg"
              title="行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱"
              travelDate="XXXX-XX-XX ~ XXXX-XX-XX"
              member="測試帳號"
              route="/sharing"
            />
            <MplansCard
              imageSrc="/iceland.jpeg"
              title="行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱"
              travelDate="XXXX-XX-XX ~ XXXX-XX-XX"
              member="測試帳號"
              route="/sharing"
            />{" "}
            <MplansCard
              imageSrc="/iceland.jpeg"
              title="行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱"
              travelDate="XXXX-XX-XX ~ XXXX-XX-XX"
              member="測試帳號"
              route="/sharing"
            />{" "}
            <MplansCard
              imageSrc="/iceland.jpeg"
              title="行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱行程名稱"
              travelDate="XXXX-XX-XX ~ XXXX-XX-XX"
              member="測試帳號"
              route="/sharing"
            />
          </SimpleGrid>
          <div className="mt-20">
            <Box maw={1200} mx="auto">
              <Group justify="center" mb={20}>
                <Button
                  size="md"
                  radius="md"
                  // fullWidth
                  color="#2C3E50"
                  onClick={toggle}
                  styles={{
                    root: {
                      color: "#fdfcf9",
                    },
                  }}
                  rightSection={<IconHandClick size={20} />}
                >
                  網站功能導覽
                </Button>
              </Group>
              <Collapse in={opened}>
                <Text>
                  快速上手快速上手快速上手快速上手快速上手快速上手快速上手
                  快速上手 快速上手 快速上手 快速上手 快速上手 快速上手
                  快速上手快速上手快速上手快速上手快速上手快速上手快速上手
                  快速上手 快速上手 快速上手 快速上手 快速上手 快速上手
                  快速上手快速上手快速上手快速上手快速上手快速上手快速上手
                  快速上手 快速上手 快速上手 快速上手 快速上手 快速上手
                  快速上手快速上手快速上手快速上手快速上手快速上手快速上手
                  快速上手 快速上手 快速上手 快速上手 快速上手 快速上手
                  快速上手快速上手快速上手快速上手快速上手快速上手快速上手
                  快速上手 快速上手 快速上手 快速上手 快速上手 快速上手
                  快速上手快速上手快速上手快速上手快速上手快速上手快速上手
                  快速上手 快速上手 快速上手 快速上手 快速上手 快速上手
                  快速上手快速上手快速上手快速上手快速上手快速上手快速上手
                  快速上手 快速上手 快速上手 快速上手 快速上手 快速上手
                </Text>
              </Collapse>
            </Box>
          </div>
        </div>
      </div>
    </>
  );
}

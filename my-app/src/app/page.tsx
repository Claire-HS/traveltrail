"use client";
import { Box, Text, Button, Group, Collapse } from "@mantine/core";
import { IconMapSearch, IconSearch, IconHandClick } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import { useDisclosure } from "@mantine/hooks";
import { useUser } from "@/context/UserContext";
import { notify } from "@/utilities/notify";
import PublicPlansGrid from "@/components/PublicPlansGrid";

export default function Home() {
  const user = useUser();
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);

  const handleClick = () => {
    if (!user) {
      notify({ type: "warning", message: "請先登入！" });
      return;
    }
    router.replace("/search");
  };

  return (
    <>
      <div className="w-full h-96 mt-5 border-b border-black flex justify-center relative">
        <img
          src="/banner.png"
          alt="banner"
          className="w-full h-96 object-cover"
        />
        <div className="w-96 absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 flex justify-center">
          <Button
            size="md"
            radius="md"
            color="#2C3E50"
            onClick={handleClick}
            styles={{
              root: {
                backgroundColor: "rgba(44, 62, 80, 0.7)",
                color: "#ffffff",
                backdropFilter: "blur(4px)",
              },
            }}
            rightSection={<IconMapSearch size={20} />}
          >
            探索景點
          </Button>
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
        <div className="w-full pb-15 flex flex-col justify-center items-center min-h-[500px]">
          <PublicPlansGrid />
          <div className="mt-20">
            <Box maw={1200} mx="auto">
              <Group justify="center" mb={20}>
                <Button
                  size="md"
                  radius="md"
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

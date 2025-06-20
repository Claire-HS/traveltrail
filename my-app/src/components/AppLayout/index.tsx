"use client";
import { AppShell, Container } from "@mantine/core";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { useUser } from "@/context/UserContext";
import { notify } from "@/utilities/notify";
import { IconCalendarCheck } from "@tabler/icons-react";
// import { useDisclosure } from "@mantine/hooks";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const router = useRouter();
  const handleClick = () => {
    if (!user) {
      notify({ type: "warning", message: "請先登入！" });
      return;
    }
    router.replace("/myplans");
  };

  return (
    <AppShell header={{ height: 60 }} footer={{ height: 60 }}>
      <AppShell.Header
        className="w-full flex justify-between  shadow-md"
        style={{ borderBottom: "none" }}
      >
        <div
          className="w-full h-full pl-4 text-4xl font-bold flex items-center bg-background text-foreground cursor-pointer"
          onClick={() => router.push("/")}
        >
          TravelTrail
        </div>
        <div className="w-xs h-full  pr-4 flex text-2xl font-semibold flex items-center justify-end gap-2 bg-background text-foreground">
          <div
            className="px-1 rounded-xl border cursor-pointer"
            onClick={handleClick}
          >
            行程
          </div>
          <div className="px-1 rounded-xl  border">
            <AuthModal buttonClassName="w-full cursor-pointer"></AuthModal>
          </div>
        </div>
      </AppShell.Header>
      <AppShell.Main className="bg-background flex flex-col">
        {/* <Container fluid className="h-full flex-grow"> */}
        {children}
        {/* </Container> */}
      </AppShell.Main>
      <AppShell.Footer style={{ borderTop: "none" }}>
        <div className="w-full h-full px-4 text-base font-semibold flex justify-center items-center bg-[#2C3E50] text-[#FDFCF9]">
          COPYRIGHT @ 2025 TravelTrail
        </div>
      </AppShell.Footer>
    </AppShell>
  );
}

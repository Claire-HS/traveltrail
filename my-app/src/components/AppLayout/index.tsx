"use client";
import { AppShell, Burger, Container } from "@mantine/core";
import AuthModal from "@/components/AuthModal";
import { useDisclosure } from "@mantine/hooks";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 60 }} footer={{ height: 60 }}>
      <AppShell.Header
        className="w-full flex justify-between  shadow-md"
        style={{ borderBottom: "none" }}
      >
        <div className="w-full h-full pl-4 text-4xl font-bold flex items-center bg-background text-foreground">
          TravelTrail
        </div>
        <div className="w-xs h-full  pr-4 flex text-2xl font-semibold flex items-center justify-between bg-background text-foreground">
          <div className="w-[110px] px-1 rounded-xl flex justify-center border">
            我的行程
          </div>
          <div className="w-[110px] px-1 rounded-xl flex justify-center border">
            <AuthModal buttonClassName="w-full cursor-pointer"></AuthModal>
          </div>
        </div>
      </AppShell.Header>
      <AppShell.Main className="bg-background flex flex-col">
        <Container fluid className="h-full flex-grow">
          {children}
        </Container>
      </AppShell.Main>
      <AppShell.Footer style={{ borderTop: "none" }}>
        <div className="w-full h-full px-4 text-base font-semibold flex justify-center items-center bg-[#2C3E50] text-[#FDFCF9]">
          COPYRIGHT @ 2025 TravelTrail
        </div>
      </AppShell.Footer>
    </AppShell>
  );
}

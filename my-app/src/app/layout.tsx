import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import AppLayout from "@/components/AppLayout";
import { UserProvider } from "@/context/UserContext";
import { DatesProvider } from "@mantine/dates";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelTrail",
  description:
    "TravelTrail提供景點搜索、清單收藏、行程建立、筆記備註、費用記帳及共同編輯等多項功能，幫助旅人們輕鬆規劃與管理每一趟旅遊行程。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <DatesProvider settings={{ firstDayOfWeek: 0 }}>
            <MantineProvider>
              <ModalsProvider>
                <Notifications position="top-center" />
                <AppLayout>{children}</AppLayout>
              </ModalsProvider>
            </MantineProvider>
          </DatesProvider>
        </UserProvider>
      </body>
    </html>
  );
}

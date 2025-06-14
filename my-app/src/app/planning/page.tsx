"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SidebarList from "@/components/SidebarList";

const ItineraryEditor = dynamic(() => import("@/components/ItineraryEditor"), {
  ssr: false,
});

export default function PlanningPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // 用 useCallback 包裝，避免每次 render 都創建新函式
  const handleExpandChange = useCallback((expanded: boolean) => {
    setSidebarExpanded(expanded);
  }, []);

  return (
    <div className="flex h-[calc(100vh-160px)] w-[98vw] mt-5 mx-auto rounded-md shadow-lg shadow-foreground/50 relative ">
      {/* 地圖區塊：根據 sidebar 展開切換寬度 */}
      <div
        className="transition-all duration-300 p-4 bg-gray-500"
        style={{ flexBasis: sidebarExpanded ? "50%" : "75%" }}
      >
        預留地圖區塊
      </div>

      {/* 側邊欄：展開時 1/4，收合時固定 */}
      <SidebarList onExpandChange={handleExpandChange}/>
      {/* 右側行程編輯器 - 固定 1/4 */}
      <div className="basis-1/4 flex-shrink-0 min-w-0 bg-blue-100 p-4">
        <ItineraryEditor />
      </div>
    </div>
  );
}

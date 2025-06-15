"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SidebarList from "@/components/SidebarList";

const ItineraryEditor = dynamic(() => import("@/components/ItineraryEditor"), {
  ssr: false,
});

export default function PlanningPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sidebarPlaces, setSidebarPlaces] = useState<any[]>([]);
  const [itineraryPlaces, setItineraryPlaces] = useState<any[]>([]);

  // 用 useCallback 包裝，避免每次 render 都創建新函式
  const handleExpandChange = useCallback((expanded: boolean) => {
    setSidebarExpanded(expanded);
  }, []);

  // 處理dnd
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const place = active.data.current?.place;
    if (!place) return;

    if (over.id === "itinerary-dropzone") {
      // 加入行程
      const exists = itineraryPlaces.some((p) => p.id === place.id);
      if (!exists) {
        setItineraryPlaces((prev) => [...prev, place]);
        setSidebarPlaces((prev) => prev.filter((p) => p.id !== place.id));
      }
    } else if (over.id === "sidebar-dropzone") {
      // 移回 Sidebar
      const exists = sidebarPlaces.some((p) => p.id === place.id);
      if (!exists) {
        setSidebarPlaces((prev) => [...prev, place]);
        setItineraryPlaces((prev) => prev.filter((p) => p.id !== place.id));
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-160px)] w-[98vw] mt-5 mx-auto rounded-md shadow-lg shadow-foreground/50 relative ">
        {/* 地圖區塊：根據 sidebar 展開切換寬度 */}
        <div
          className="transition-all duration-300 p-4 bg-gray-500"
          style={{ flexBasis: sidebarExpanded ? "50%" : "75%" }}
        >
          預留地圖區塊
        </div>

        {/* 側邊欄：展開時 1/4，收合時固定 */}
        <SidebarList onExpandChange={handleExpandChange} />
        {/* 右側行程編輯器 - 固定 1/4 */}
        <div className="basis-1/4 flex-shrink-0 min-w-0 bg-blue-100 p-4">
          <ItineraryEditor />
        </div>
      </div>{" "}
    </DndContext>
  );
}

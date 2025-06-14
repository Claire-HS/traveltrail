"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import SortableItem from "@/components/SortableItem";

const defaultDayItems = [
  { id: "1", time: "08:00", title: "Reykjavík Airport" },
  { id: "2", time: "09:00", title: "彩虹街" },
  { id: "3", time: "10:08", title: "Hallgrimskirkja" },
];

export default function ItineraryEditor() {
  const sensors = useSensors(useSensor(PointerSensor));
  const [days, setDays] = useState([
    {
      id: "day-1",
      title: "第1天",
      date: "10/02 (週三)",
      items: defaultDayItems,
    },
  ]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentItems = [...days];
    const activeDay = currentItems[activeDayIndex];
    const oldIndex = activeDay.items.findIndex((i) => i.id === active.id);
    const newIndex = activeDay.items.findIndex((i) => i.id === over.id);
    activeDay.items = arrayMove(activeDay.items, oldIndex, newIndex);
    setDays(currentItems);
  };

  const handleAddDay = () => {
    const newIndex = days.length + 1;
    const newDay = {
      id: `day-${newIndex}`,
      title: `第${newIndex}天`,
      date: "",
      items: [],
    };
    setDays([...days, newDay]);
    setActiveDayIndex(days.length);
  };

  return (
    <>
      <div className="basis-1/4 flex flex-col">
        <div className="flex items-center gap-1 border-b px-4 py-2">
          {days.map((day, index) => (
            <button
              key={day.id}
              onClick={() => setActiveDayIndex(index)}
              className={`px-3 py-1 text-sm rounded ${
                activeDayIndex === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {day.title}
            </button>
          ))}
          <button
            onClick={handleAddDay}
            className="ml-auto text-blue-500 hover:text-blue-700 font-bold text-xl"
          >
            ＋
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold">
              {days[activeDayIndex].title} · {days[activeDayIndex].date}
            </h2>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={days[activeDayIndex].items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {days[activeDayIndex].items.map((item, index) => (
                  <SortableItem key={item.id} item={item} index={index} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </>
  );
}

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";

export default function SortableItem({
  item,
  index,
  onTimeChange,
}: {
  item: { id: string; time: string; title: string };
  index: number;
  onTimeChange: (id: string, time: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 border-b bg-white"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400">
        <IconGripVertical />
      </div>
      <div className="flex flex-col gap-1">
        <input
          type="time"
          value={item.time || ""}
          onChange={(e) => onTimeChange(item.id, e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 w-28"
        />
        <div className="font-medium">{item.title || "未命名地點"}</div>
      </div>
    </li>
  );
}

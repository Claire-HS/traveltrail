"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";

export default function SortableItem({
  item,
  index,
}: {
  item: { id: string; time: string; title: string };
  index: number;
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
      <div>
        <div className="text-sm text-gray-500">{item.time}</div>
        <div className="font-medium">{item.title}</div>
      </div>
    </li>
  );
}

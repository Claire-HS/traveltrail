import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  title: string;
  time?: string;
  note?: string | null;
  address?: string;
  location?: { lat: number; lng: number };
  index: number;
  onTimeChange: (itemId: string, newTime: string) => void;
  onDelete?: (itemId: string) => void;
  onUpdateNote?: (itemId: string, newNote: string | null) => void;
  [key: string]: any;
}

export default function SortableItem({
  id,
  title,
  time = "",
  note,
  address,
  location,
  index,
  onTimeChange,
  onDelete,
  onUpdateNote,
  ...rest
}: SortableItemProps) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(note || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(id, e.target.value);
  };

  const handleNoteSubmit = () => {
    if (onUpdateNote) {
      onUpdateNote(id, editingNote.trim() || null);
    }
    setIsEditingNote(false);
  };

  const handleNoteCancel = () => {
    setEditingNote(note || "");
    setIsEditingNote(false);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm("確定要刪除這個景點嗎？")) {
      onDelete(id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* 拖拽手柄 */}
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          title="拖拽排序"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6h10M3 10h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {/* 主要內容 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* 景點標題 */}
              <h3 className="font-medium text-gray-900 truncate">
                {index + 1}. {title}
              </h3>

              {/* 地址 */}
              {address && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  📍 {address}
                </p>
              )}

              {/* 時間輸入 */}
              <div className="mt-2 flex items-center gap-2">
                <label className="text-sm text-gray-500">時間：</label>
                <input
                  type="time"
                  value={time}
                  onChange={handleTimeChange}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 備註區域 */}
              <div className="mt-2">
                {isEditingNote ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      placeholder="輸入備註..."
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleNoteSubmit}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleNoteCancel}
                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingNote(true)}
                    className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 rounded p-1 min-h-[24px] flex items-center"
                    title="點擊編輯備註"
                  >
                    {note ? (
                      <span>💬 {note}</span>
                    ) : (
                      <span className="text-gray-400 italic">
                        點擊添加備註...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex-shrink-0">
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="刪除景點"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 2h4M2 4h12M3 4l1 10h8l1-10M6 6v6M10 6v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import React from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// interface SortableItemProps {
//   id: string;
//   children: React.ReactNode;
// }

// export default function SortableItem({ id, children }: SortableItemProps) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     cursor: "grab",
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       {children}
//     </div>
//   );
// }

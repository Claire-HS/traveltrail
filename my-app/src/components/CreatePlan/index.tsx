"use client";
import { useState, ReactNode } from "react";
import { Button, Overlay } from "@mantine/core";

interface CreatePlanProps {
  onCreate: (data: {
    name: string;
    startDate: string | null;
    endDate: string | null;
    note: string;
  }) => void;
  children?: (showCreateUI: () => void) => ReactNode;
}

export default function CreatePlan({ onCreate, children }: CreatePlanProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [noDate, setNoDate] = useState(false);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("請輸入行程名稱");
      return;
    }
    if (!noDate && (!startDate.trim() || !endDate.trim())) {
      alert("請選擇日期或勾選「日期未定」");
      return;
    }

    onCreate({
      name: name.trim(),
      startDate: noDate ? null : startDate.trim(),
      endDate: noDate ? null : endDate.trim(),
      note: note.trim(),
    });

    // 清空欄位
    setName("");
    setStartDate("");
    setEndDate("");
    setNote("");
    setNoDate(false);
    setIsOpen(false);
  };

  return (
    <>
      {children ? (
        children(() => setIsOpen(true))
      ) : (
        <div className="flex justify-end px-2 py-1 mt-1 ">
          <Button
            variant="light"
            color="#2C3E50"
            size="xs"
            radius="xl"
            onClick={() => setIsOpen(true)}
          >
            新增行程
          </Button>
        </div>
      )}

      {isOpen && (
        <>
          <Overlay color="#000" backgroundOpacity={0.5} zIndex={90} />
          <div className="absolute bg-white rounded-lg shadow-lg p-4 w-[100%] max-w-sm top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]">
            <div className="">
              <h2 className="text-lg font-semibold mb-2">新增行程</h2>

              <label className="block text-sm mb-1">行程名稱 *</label>
              <input
                className="w-full border rounded p-1 mb-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="輸入行程名稱"
              />

              <label className="block text-sm mb-1">行程日期</label>
              <div className="flex flex-col gap-1 mb-2">
                <input
                  type="date"
                  className="w-full border rounded p-1 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={noDate}
                />
                <span className="self-center">至</span>
                <input
                  type="date"
                  className="w-full border rounded p-1 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={noDate}
                />
              </div>

              <label className="text-sm inline-flex items-center mb-2">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={noDate}
                  onChange={() => setNoDate((prev) => !prev)}
                />
                日期未定
              </label>

              <label className="block text-sm mb-1">備註</label>
              <textarea
                className="w-full border rounded p-1 mb-2 text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="選填"
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1 border rounded text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-[#2C3E50] text-white px-4 py-1 rounded text-sm"
                >
                  確定
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

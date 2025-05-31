"use client";
import { useState } from "react";
import { Button } from "@mantine/core";

interface CreatePlanProps {
  onCreate: (data: { name: string; date: string | null; note: string }) => void;
}

export default function CreatePlan({ onCreate }: CreatePlanProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [noDate, setNoDate] = useState(false);
  const [note, setNote] = useState("");

  // const [newPlan, setNewPlan] = useState("");
  // const [newPlanDate, setNewPlanDate] = useState("");
  // const [dateUndecided, setDateUndecided] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("請輸入行程名稱");
      return;
    }
    if (!noDate && !date.trim()) {
      alert("請選擇日期或勾選「日期未定」");
      return;
    }

    onCreate({
      name: name.trim(),
      date: noDate ? null : date.trim(),
      note: note.trim(),
    });

    // 清空欄位
    setName("");
    setDate("");
    setNote("");
    setNoDate(false);
    setIsOpen(false);
  };

  return (
    <>
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
      {/* <button
        onClick={() => setIsOpen(true)}
        className="text-sm px-4 py-1 border rounded"
      >
        新增行程
      </button> */}

      {isOpen && (
        <div className="absolute top-50 left-20 w-64">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold mb-2">新增行程</h2>

            <label className="block text-sm mb-1">行程名稱 *</label>
            <input
              className="w-full border rounded p-1 mb-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入行程名稱"
            />

            <label className="block text-sm mb-1">行程日期</label>
            <input
              type="date"
              className="w-full border rounded p-1 mb-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={noDate}
            />

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
      )}
    </>
  );
}

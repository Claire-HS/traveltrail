"use client";
import { useState } from "react";
import {
  Flex,
  TextInput,
  Textarea,
  Checkbox,
  Button,
  Group,
  Stack,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notify } from "@/utilities/notify";
import { IconCalendar } from "@tabler/icons-react";

interface CreatePlanProps {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    startDate: string | null;
    endDate: string | null;
    note: string;
  }) => void;
  isLoading?: boolean;
}

export default function CreatePlan({
  onClose,
  onCreate,
  isLoading,
}: CreatePlanProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [noDate, setNoDate] = useState(false);
  const [note, setNote] = useState("");
  const icon = <IconCalendar size={20} stroke={1.5} />;

  const handleSubmit = () => {
    if (!name.trim()) {
      notify({ type: "warning", message: "請輸入行程名稱" });
      return;
    }
    if (!noDate && (!startDate || !endDate)) {
      notify({ type: "warning", message: "請選擇日期或勾選「日期未定」" });
      return;
    }
    if (
      !noDate &&
      startDate &&
      endDate &&
      new Date(endDate) < new Date(startDate)
    ) {
      notify({ type: "warning", message: "結束日期不能早於開始日期" });
      return;
    }

    onCreate({
      name: name.trim(),
      startDate: noDate ? null : startDate,
      endDate: noDate ? null : endDate,
      note: note.trim(),
    });

    // 清空欄位
    setName("");
    setStartDate(null);
    setEndDate(null);
    setNote("");
    setNoDate(false);
  };

  return (
    <Flex direction="column" gap="sm">
      <TextInput
        label="行程名稱"
        placeholder="輸入行程名稱"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />

      <div>
        <label style={{ fontSize: "14px", fontWeight: 500 }}>行程日期</label>
        <Stack gap="xs" mt="xs">
          <Checkbox
            label="日期未定"
            checked={noDate}
            onChange={() => setNoDate((prev) => !prev)}
          />
          <DatePickerInput
            label="開始日期"
            value={startDate}
            valueFormat="YYYY-MM-DD"
            onChange={setStartDate}
            disabled={noDate}
            placeholder="YYYY-MM-DD"
            leftSection={icon}
            leftSectionPointerEvents="none"
            firstDayOfWeek={0}
            clearable
          />
          <DatePickerInput
            label="結束日期"
            value={endDate}
            valueFormat="YYYY-MM-DD"
            onChange={setEndDate}
            disabled={noDate}
            placeholder="YYYY-MM-DD"
            leftSection={icon}
            leftSectionPointerEvents="none"
            firstDayOfWeek={0}
            clearable
          />
        </Stack>
      </div>

      <Textarea
        label="行程備註"
        placeholder="選填"
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
        autosize
        minRows={2}
      />

      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={onClose}>
          取消
        </Button>
        <Button loading={isLoading} color="dark" onClick={handleSubmit}>
          確定
        </Button>
      </Group>
    </Flex>
  );
}

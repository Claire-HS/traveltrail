import {
  Card,
  Text,
  ActionIcon,
  Modal,
  Button,
  Group,
  Flex,
  Image,
  Textarea,
  Menu,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";

interface ListItem {
  id: string;
  name: string;
  address: string;
  note: string | null;
  location: {
    lat: number;
    lng: number;
  };
}

interface ListItemCardProps {
  item: ListItem;
  onDelete: (id: string) => void;
  onUpdateNote: (id: string, newNote: string | null) => void;
}

export default function ListItemCard({
  item,
  onDelete,
  onUpdateNote,
}: ListItemCardProps) {
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [noteInput, setNoteInput] = useState(item.note || "");

  // 刪除確認
  const handleConfirmDelete = () => {
    onDelete(item.id);
    setDeleteModalOpened(false);
  };

  // 編輯備註確認
  const handleConfirmEditNote = () => {
    onUpdateNote(item.id, noteInput.trim() === "" ? null : noteInput.trim());
    setEditModalOpened(false);
  };

  return (
    <>
      {/* 刪除確認 Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="確定要刪除這個地點嗎？"
        centered
      >
        <Text mb="sm">
          刪除後將無法恢復，確定要從清單中移除「{item.name}」嗎？
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
            取消
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            確定刪除
          </Button>
        </Group>
      </Modal>

      {/* 編輯備註 Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title={`編輯景點備註- ${item.name}`}
        centered
        size="sm"
      >
        <Textarea
          placeholder="輸入內容"
          value={noteInput}
          onChange={(event) => setNoteInput(event.currentTarget.value)}
          autosize
          minRows={3}
        />
        <Group mt="md">
          <Button variant="default" onClick={() => setEditModalOpened(false)}>
            取消
          </Button>
          <Button onClick={handleConfirmEditNote}>儲存</Button>
        </Group>
      </Modal>

      <Card
        w={300}
        h={100}
        bg="#FDFCF9"
        shadow="sm"
        radius="md"
        padding="xs"
        className="relative border border-transparent transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:border-[#2C3E50] cursor-pointer"
      >
        <Flex gap="xs" className="h-full">
          <div className="w-[80px] bg-gray-500 rounded-md flex-shrink-0">
            預留圖片位置
          </div>
          <div className="flex flex-col gap-y-1 flex-grow">
            <Text fw={500} size="lg" lineClamp={1}>
              {item.name}
            </Text>
            <Text size="sm" lineClamp={1}>
              {item.address}
            </Text>
            <Text size="sm" lineClamp={1} c="dimmed">
              {item.note || "--尚無備註--"}
            </Text>
          </div>
          <Group className="absolute top-1 right-1 z-10">
            <Menu shadow="md" width={160} withArrow>
              <Menu.Target>
                <ActionIcon variant="transparent" color="gray">
                  <IconSettings size={20} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={() => setEditModalOpened(true)}>
                  編輯備註
                </Menu.Item>

                <Menu.Item
                  color="red"
                  onClick={() => setDeleteModalOpened(true)}
                >
                  刪除景點
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Flex>
      </Card>
    </>
  );
}

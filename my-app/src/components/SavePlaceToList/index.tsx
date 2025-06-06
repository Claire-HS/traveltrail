"use client";
import { useEffect, useState, useRef } from "react";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  Radio,
  Flex,
  Group,
  Text,
  ScrollArea,
} from "@mantine/core";
import {
  getDocs,
  collection,
  query,
  addDoc,
  where,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/library/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { notify } from "@/utilities/notify";

interface SavePlaceToListProps {
  placeData: any;
  opened: boolean;
  onClose: () => void;
}

export default function SavePlaceToList({
  placeData,
  opened,
  onClose,
}: SavePlaceToListProps) {
  const [lists, setLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [newList, setNewList] = useState("");
  const [note, setNote] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSavingPlace, setIsSavingPlace] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const lastItemRef = useRef<HTMLDivElement>(null);

  const fetchLists = async (uid: string) => {
    const q = query(collection(db, `users/${uid}/lists`));
    const docSnap = await getDocs(q);
    const data = docSnap.docs.map((doc) => {
      return {
        id: doc.id,
        listName: doc.data().name,
      };
    });
    setLists(data);
  };

  // 查詢user現有的收藏清單
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchLists(user.uid);
      }
    });
    return () => unsub();
  }, []);

  // 景點加入清單
  const handleSave = async (listId: string) => {
    if (!userId) return;
    setIsSavingPlace(true);
    try {
      const placesRef = collection(
        db,
        `users/${userId}/lists/${listId}/places`
      );

      // 檢查景點有無重複(by id)
      const q = query(placesRef, where("id", "==", placeData.id));
      const placeSnap = await getDocs(q);
      if (!placeSnap.empty) {
        notify({ type: "warning", message: "地點已存在此清單！" });
        return;
      }

      await addDoc(placesRef, {
        ...placeData,
        note: note.trim(),
        createdAt: serverTimestamp(),
      });
      setNote("");
      notify({ type: "saved", message: "成功加入清單！" });
      onClose();
    } catch (error) {
      console.error("景點儲存失敗", error);
      notify({ type: "error", message: "加入清單失敗！" });
    } finally {
      setIsSavingPlace(false);
    }
  };

  // 新增清單
  const handleCreateList = async () => {
    if (!newList.trim() || !userId) return;
    setIsCreatingList(true);
    try {
      const newListRef = doc(collection(db, `users/${userId}/lists`));
      await setDoc(newListRef, { name: newList.trim() });
      const newListId = newListRef.id;
      setLists((prev) => [...prev, { id: newListId, listName: newList }]); //append list
      setNewList("");
      // notify({ type: "success", message: "新增成功！" });
      setSelectedListId(newListId);
      setTimeout(() => {
        lastItemRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (error) {
      console.error("新增清單失敗", error);
      notify({ type: "error", message: "新增清單失敗！" });
    } finally {
      setIsCreatingList(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="加入至收藏清單"
      centered
      size="xs"
    >
      <Flex direction="column" gap="sm">
        <div>
          <Text size="sm" fw={500}>
            新增清單
          </Text>
          <Flex gap="xs" mt={4} align="center">
            <TextInput
              placeholder="輸入清單名稱"
              value={newList}
              onChange={(e) => setNewList(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Button
              variant="light"
              size="xs"
              color="#2C3E50"
              loading={isCreatingList}
              onClick={handleCreateList}
            >
              建立
            </Button>
          </Flex>
        </div>

        {lists.length === 0 ? (
          <Text size="sm" c="dimmed">
            尚無清單，請先建立。
          </Text>
        ) : (
          <>
            <Text size="sm" fw={500}>
              選擇清單
            </Text>
            <Radio.Group
              value={selectedListId}
              onChange={setSelectedListId}
              name="list-radio"
            >
              <ScrollArea h={80} type="auto" scrollbarSize={6}>
                <Flex direction="column" gap={4}>
                  {lists.map((list, idx) => (
                    <div
                      key={list.id}
                      ref={idx === lists.length - 1 ? lastItemRef : null}
                    >
                      <Radio value={list.id} label={list.listName} />
                    </div>
                  ))}
                </Flex>
              </ScrollArea>
            </Radio.Group>

            <Textarea
              label="地點備註"
              value={note}
              onChange={(e) => setNote(e.currentTarget.value)}
              placeholder="選填"
              autosize
              minRows={1}
            />
          </>
        )}

        <Group justify="space-between" pt="sm">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button
            color="#2C3E50"
            disabled={!selectedListId}
            loading={isSavingPlace}
            onClick={() => handleSave(selectedListId)}
          >
            確定
          </Button>
        </Group>
      </Flex>
    </Modal>
  );
}

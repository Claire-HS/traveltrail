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
  getDoc,
  collection,
  query,
  addDoc,
  where,
  doc,
  setDoc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "@/library/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { notify } from "@/utilities/notify";
import { create } from "domain";
import { fetchAndUploadPhoto } from "@/utilities/fetchAndUploadPhoto";

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
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);

  const fetchLists = async (uid: string) => {
    const q = query(
      collection(db, `users/${uid}/lists`),
      orderBy("name", "desc")
    );
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
      // 查詢當前最大的 order 值
      const placesQuery = query(
        collection(db, "users", userId, "lists", listId, "places"),
        orderBy("order", "desc"),
        limit(1)
      );
      const numSnap = await getDocs(placesQuery);
      let maxOrder = 0;
      if (!numSnap.empty) {
        maxOrder = numSnap.docs[0].data().order || 0;
      }

      const placesCol = collection(
        db,
        "users",
        userId,
        "lists",
        listId,
        "places"
      );

      // 用 placeData.id 檢查是否已存在（避免重複）
      const duplicateQuery = query(placesCol, where("id", "==", placeData.id));
      const duplicateSnap = await getDocs(duplicateQuery);
      if (!duplicateSnap.empty) {
        notify({ type: "warning", message: "地點已存在此清單！" });
        setIsSavingPlace(false);
        return;
      }

      // 儲存照片
      let uploadedPhotoUrl: string | null = null;
      if (placeData.photoName && placeData.id) {
        try {
          uploadedPhotoUrl = await fetchAndUploadPhoto(
            placeData.photoName,
            placeData.id
          );
        } catch (error) {
          console.warn("圖片處理失敗，略過圖片上傳", error);
        }
      }

      // 若無重複則新增（使用 Firestore 自動 ID）
      await addDoc(placesCol, {
        ...placeData,
        note: note.trim() || null,
        photoUrl: uploadedPhotoUrl || null,
        order: maxOrder + 1, // 新景點的 order 為最大值 + 1
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      notify({ type: "saved", message: "成功加入清單！" });
      setNote("");
      setSelectedListId("");
      onClose();
    } catch (error) {
      console.error("景點儲存失敗", error);
      notify({ type: "error", message: "加入清單失敗！" });
      setNote("");
      setSelectedListId("");
    } finally {
      setIsSavingPlace(false);
    }
  };

  // 新增清單
  const handleCreateList = async () => {
    if (!newList.trim() || !userId) return;
    setIsCreatingList(true);
    try {
      const docRef = await addDoc(collection(db, `users/${userId}/lists`), {
        name: newList.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const newListId = docRef.id;
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
      setNewList("");
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

"use client";

import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useState, useEffect } from "react";
import { db } from "@/library/firebase";
import {
  getDocs,
  collection,
  query,
  getDoc,
  addDoc,
  where,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import {
  Box,
  Button,
  Transition,
  Tooltip,
  Select,
  Loader,
} from "@mantine/core";
import {
  IconArrowBigRightLineFilled,
  IconArrowBigLeftLineFilled,
} from "@tabler/icons-react";
import { notify } from "@/utilities/notify";
import ListItemCard from "@/components/ListItemCard";

interface listItem {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  note: string | null;
}

interface SidebarListProps {
  onExpandChange?: (expanded: boolean) => void;
}

export default function SidebarList({ onExpandChange }: SidebarListProps) {
  const user = useAuthCheck();
  const [userId, setUserId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [listDetail, setListDetail] = useState<any | null>(null);
  const [listItems, setListItems] = useState<listItem[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // 取得lists
  const fetchLists = async (uid: string) => {
    setIsFetching(true);
    try {
      const q = query(
        collection(db, `users/${uid}/lists`),
        orderBy("name", "desc")
      );
      const docSnap = await getDocs(q);
      const data = docSnap.docs.map((doc) => {
        return {
          value: doc.id,
          label: doc.data().name,
        };
      });
      setLists(data);
    } catch (error) {
      console.error("取得行程失敗", error);
      notify({ type: "error", message: "取得行程失敗，請稍後再試！" });
      setLists([]);
    } finally {
      setIsFetching(false);
    }
  };

  // 更新備註
  const handleUpdateNote = async (id: string, newNote: string | null) => {
    try {
      const itemRef = doc(
        db,
        `users/${userId}/lists/${selectedList}/places/${id}`
      );
      await updateDoc(itemRef, { note: newNote });
      setListItems((prev) =>
        prev
          ? prev.map((item) =>
              item.id === id ? { ...item, note: newNote } : item
            )
          : prev
      );
    } catch (error) {
      console.error("更新備註失敗", error);
      notify({ type: "error", message: "更新備註失敗，請稍後再試！" });
    }
  };

  // 刪除景點
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(
        doc(db, `users/${userId}/lists/${selectedList}/places/${id}`)
      );
      setListItems((prev) => prev?.filter((item) => item.id !== id) || []);
    } catch (error) {
      console.error("刪除失敗", error);
      notify({ type: "error", message: "景點刪除失敗，請稍後再試！" });
    }
  };

  // 查詢user現有的收藏清單
  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      fetchLists(user.uid);
    }
  }, [user]);

  // 取得清單景點
  useEffect(() => {
    const fetchListDetail = async () => {
      if (userId && selectedList) {
        try {
          const docRef = doc(db, `users/${userId}/lists/${selectedList}`);

          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setListDetail(docSnap.data());
          } else {
            notify({ type: "warning", message: "查無此清單！" });
            setListDetail(null);
          }

          const itemsRef = collection(
            db,
            `users/${userId}/lists/${selectedList}/places`
          );
          const itemsSnap = await getDocs(itemsRef);
          const itemsData: listItem[] = itemsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              address: data.address,
              location: data.location,
              note: data.note ?? null,
            };
          });
          setListItems(itemsData);
        } catch (error) {
          console.error("取得清單內容失敗", error);
          setListDetail(null);
          setListItems(null);
        }
      } else {
        setListDetail(null); // 清空舊的
        setListItems(null);
      }
    };

    fetchListDetail();
  }, [userId, selectedList]);

  useEffect(() => {
    onExpandChange?.(expanded);
  }, [expanded, onExpandChange]);

  if (user === undefined) return null;

  return (
    <>
      {/* 展開狀態：basis-1/4 */}
      <Transition
        mounted={expanded}
        transition="fade-left"
        duration={300}
        timingFunction="ease"
        keepMounted
      >
        {(styles) => (
          <Box
            style={styles}
            className="h-full basis-1/4 bg-gray-200 p-3 relative flex flex-col"
          >
            <Button
              variant="subtle"
              onClick={() => setExpanded(false)}
              size="compact-md"
              className="mx-auto mb-2"
            >
              <IconArrowBigRightLineFilled size={30} />
            </Button>
            <div className="mb-3 text-center text-lg font-semibold ">
              收藏清單
            </div>

            <Select
              label="選擇清單:"
              placeholder="清單名稱"
              checkIconPosition="left"
              data={lists}
              value={selectedList}
              onChange={setSelectedList}
              clearable
              searchable
              nothingFoundMessage="找不到清單"
            />
            <div className="flex-1 mt-5 p-2 overflow-y-auto">
              {selectedList === null ? null : listItems === null ? (
                <div className="mt-25 text-center">
                  <Loader color="blue" size={30} />
                </div>
              ) : listItems.length === 0 ? (
                <div className="mt-10 text-center text-gray-500">
                  這個清單還沒有收藏任何地點
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 justify-center">
                  {listItems.map((item) => (
                    <ListItemCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                      onUpdateNote={handleUpdateNote}
                    />
                  ))}
                </div>
              )}
            </div>
          </Box>
        )}
      </Transition>

      {/* 收合狀態：固定寬度 */}
      {!expanded && (
        <div
          className="bg-gray-100 flex items-center justify-center flex-shrink-0"
          style={{ flexBasis: expanded ? "25%" : "60px" }}
        >
          <Tooltip label="收藏清單" offset={7}>
            <Button
              variant="subtle"
              onClick={() => setExpanded(true)}
              size="compact-md"
            >
              <IconArrowBigLeftLineFilled size={30} />
            </Button>
          </Tooltip>
        </div>
      )}
    </>
  );
}

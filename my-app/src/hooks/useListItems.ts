import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import { db } from "@/library/firebase";
import { notify } from "@/utilities/notify";

interface PlaceWithDocId {
  docId: string; // Firestore 文件ID
  id: string; // Google Place ID
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  note: string | null; // add from user
  photoUrl: string;
  order: number; // 用於排序
  updatedAt: Timestamp | FieldValue;
}

export function useListItems(userId: string | null, listId: string | null) {
  const [places, setPlaces] = useState<PlaceWithDocId[]>([]);
  const [isLoadingListItems, setIsLoadingListItems] = useState(false);

  useEffect(() => {
    if (!userId || !listId) return;

    setIsLoadingListItems(true);
    const q = query(
      collection(db, `users/${userId}/lists/${listId}/places`),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        })) as PlaceWithDocId[];
        setPlaces(data);
        setIsLoadingListItems(false);
      },
      (error) => {
        console.error("清單景點讀取錯誤", error);
        notify({ type: "error", message: "取得清單景點失敗，請稍後再試！" });
        setPlaces([]);
        setIsLoadingListItems(false);
      }
    );

    return () => unsubscribe();
  }, [userId, listId]);

  return { places, isLoadingListItems };
}

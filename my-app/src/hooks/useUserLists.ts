import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/library/firebase";
import { notify } from "@/utilities/notify";

export function useUserLists(uid: string | null) {
  const [lists, setLists] = useState<Array<{ value: string; label: string }>>(
    []
  );
  const [isFetchingLists, setIsFetchingLists] = useState(false);

  useEffect(() => {
    if (!uid) return;
    setIsFetchingLists(true);

    const q = query(
      collection(db, `users/${uid}/lists`),
      orderBy("name", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().name,
        }));
        setLists(data);
        setIsFetchingLists(false);
      },
      (error) => {
        console.error("取得清單失敗", error);
        notify({ type: "error", message: "取得清單列表失敗，請稍後再試！" });
        setLists([]);
        setIsFetchingLists(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { lists, isFetchingLists };
}

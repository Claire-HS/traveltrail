import { useEffect, useState } from "react";
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

interface SavePlaceToListProps {
  placeData: any;
  onClose: () => void;
}

export default function SavePlaceToList({
  placeData,
  onClose,
}: SavePlaceToListProps) {
  const [lists, setLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [newList, setNewList] = useState("");
  const [note, setNote] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const fetchLists = async (uid: string) => {
    const q = query(collection(db, `users/${uid}/lists`));
    const docSnap = await getDocs(q);
    const data = docSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        listName: d.name,
      };
    });
    setLists(data);
  };

  useEffect(() => {
    // 查詢user現有的收藏清單
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
    try {
      const placesRef = collection(
        db,
        `users/${userId}/lists/${listId}/places`
      );

      // 檢查景點有無重複(by id)
      const q = query(placesRef, where("id", "==", placeData.id));
      const placeSnap = await getDocs(q);
      if (!placeSnap.empty) {
        alert("此地點已在本清單中！");
        return;
      }

      await addDoc(placesRef, {
        ...placeData,
        note: note.trim(),
        createdAt: serverTimestamp(),
      });
      setNote("");
      alert("已儲存至清單！");
      onClose();
    } catch (error) {
      console.error("景點儲存失敗", error);
      alert("景點儲存失敗");
    }
  };

  // 新增清單
  const handleCreateList = async () => {
    if (!newList.trim() || !userId) return;
    try {
      const newListRef = doc(collection(db, `users/${userId}/lists`));
      await setDoc(newListRef, { name: newList.trim() });
      const newListId = newListRef.id;
      setLists((prev) => [...prev, { id: newListId, listName: newList }]); //append list
      setNewList("");
      alert("已新增清單！");
      setSelectedListId(newListId);
    } catch (error) {
      console.error("新增清單失敗", error);
      alert("新增清單失敗");
    }
  };

  return (
    <div>
      {lists.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-base font-medium mt-1">選擇清單：</p>
            {lists.map((list) => (
              <label key={list.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="selectedList"
                  value={list.id}
                  checked={selectedListId === list.id}
                  onChange={() => setSelectedListId(list.id)}
                />
                <span>{list.listName}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium">備註：</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded p-1 text-xs"
              rows={1}
              placeholder="選填"
            />
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium">新增清單：</p>
        <input
          value={newList}
          onChange={(e) => setNewList(e.target.value)}
          placeholder="輸入清單名稱"
          className="border rounded p-1 w-full"
        />
        <button
          onClick={handleCreateList}
          className="bg-[#8C6E63] text-white px-4 py-1 rounded mt-1"
        >
          建立清單
        </button>
      </div>

      {lists.length === 0 && (
        <p className="text-sm text-gray-600">尚無清單，請先建立。</p>
      )}

      <div className="flex justify-between pt-1 mt-2">
        <button
          onClick={onClose}
          className="px-4 py-1 border rounded cursor-pointer"
        >
          取消
        </button>
        <button
          onClick={() => handleSave(selectedListId)}
          className="bg-[#2C3E50] text-[#FAF3EB] px-4 py-1 rounded cursor-pointer disabled:cursor-not-allowed"
          disabled={!selectedListId}
        >
          確定
        </button>
      </div>
    </div>
  );
}

"use client";
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
import CreatePlan from "@/components/CreatePlan";

interface SavePlaceToPlanProps {
  placeData: any;
  onClose: () => void;
}

interface PlanInput {
  name: string;
  date?: string | null;
  note?: string;
}

export default function SavePlaceToPlan({
  placeData,
  onClose,
}: SavePlaceToPlanProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  //   const [newPlan, setNewPlan] = useState("");
  const [note, setNote] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const fetchPlans = async (uid: string) => {
    const q = query(collection(db, `users/${uid}/plans`));
    const docSnap = await getDocs(q);
    const data = docSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        planName: d.name,
      };
    });
    setPlans(data);
  };

  useEffect(() => {
    // 查詢user現有的行程
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchPlans(user.uid);
      }
    });
    return () => unsub();
  }, []);

  // 景點加入行程
  const handleSave = async (planId: string) => {
    if (!userId) return;
    try {
      const placesRef = collection(
        db,
        `users/${userId}/plans/${planId}/places`
      );

      // 檢查景點有無重複(by id)
      const q = query(placesRef, where("id", "==", placeData.id));
      const placeSnap = await getDocs(q);
      if (!placeSnap.empty) {
        alert("此地點已在本行程中！");
        return;
      }

      await addDoc(placesRef, {
        ...placeData,
        note: note.trim(),
        createdAt: serverTimestamp(),
      });
      setNote("");
      alert("已儲存至行程！");
      onClose();
    } catch (error) {
      console.error("景點儲存失敗", error);
      alert("景點儲存失敗");
    }
  };

  // 新增行程
  const handleCreatePlan = async ({ name, date, note }: PlanInput) => {
    if (!name.trim() || !userId) return;
    try {
      const newPlanRef = doc(collection(db, `users/${userId}/plans`));
      await setDoc(newPlanRef, {
        name,
        date: date || null,
        note: note?.trim() || null,
        createdAt: serverTimestamp(),
      });
      const newPlanId = newPlanRef.id;
      setPlans((prev) => [...prev, { id: newPlanId, planName: name }]); //append plan
      //   setNewPlan("");
      alert("已新增行程！");
      setSelectedPlanId(newPlanId);
    } catch (error) {
      console.error("新增行程失敗", error);
      alert("新增行程失敗");
    }
  };

  return (
    <div>
      <div className="mt-2">
        <CreatePlan onCreate={handleCreatePlan} />
      </div>
      {plans.length === 0 && (
        <p className="text-sm text-gray-600">尚無行程，請先建立。</p>
      )}
      {plans.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-base font-medium mt-1">選擇行程：</p>
            {plans.map((plan) => (
              <label key={plan.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="selectedPlan"
                  value={plan.id}
                  checked={selectedPlanId === plan.id}
                  onChange={() => setSelectedPlanId(plan.id)}
                />
                <span>{plan.planName}</span>
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
      <div className="flex justify-between pt-1 mt-2">
        <button
          onClick={onClose}
          className="px-4 py-1 border rounded cursor-pointer"
        >
          取消
        </button>
        <button
          onClick={() => handleSave(selectedPlanId)}
          className="bg-[#2C3E50] text-[#FAF3EB] px-4 py-1 rounded cursor-pointer disabled:cursor-not-allowed"
          disabled={!selectedPlanId}
        >
          確定
        </button>
      </div>
    </div>
  );
}

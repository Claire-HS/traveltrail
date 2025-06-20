import { useEffect, useState } from "react";
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import { db } from "@/library/firebase";
import { notify } from "@/utilities/notify";

interface PlanInput {
  name: string;
  startDate: string | null;
  endDate: string | null;
  note: string | null;
}

interface PlanInfo extends PlanInput {
  days?: any[];
}

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

export function usePlanOverview(userId: string | null, planId: string | null) {
  const [info, setInfo] = useState<PlanInfo | null>(null);
  const [tempData, setTempData] = useState<PlaceWithDocId[]>([]);
  const [daysListData, setDaysListData] = useState<string[]>([]);
  const [dayPlacesData, setDayPlacesData] =
    useState<Record<string, PlaceWithDocId[]>>();

  useEffect(() => {
    if (!userId || !planId) return;

    // 監聽行程基本資料
    const planRef = doc(db, `users/${userId}/plans/${planId}`);
    const unsubPlan = onSnapshot(
      planRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setInfo({
            name: data.name ?? "",
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
            note: data.note ?? null,
            days: data.days ?? [],
          });
        }
      },
      (error) => {
        console.error("行程資料讀取錯誤", error);
        notify({ type: "error", message: "行程資料讀取錯誤" });
      }
    );

    // 監聽暫存景點
    const tempQuery = query(
      collection(db, `users/${userId}/plans/${planId}/tempPlaces`),
      orderBy("order", "asc")
    );
    const unsubTemp = onSnapshot(tempQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      })) as PlaceWithDocId[];
      setTempData(data);
    });

    // 監聽天數與景點
    const daysRef = collection(db, `users/${userId}/plans/${planId}/days`);
    const unsubDays = onSnapshot(daysRef, async (daysSnap) => {
      const dayPlacesMap: Record<string, PlaceWithDocId[]> = {};
      const dayIdList: string[] = [];

      const unsubList: (() => void)[] = [];

      for (const dayDoc of daysSnap.docs) {
        const dayId = dayDoc.id;
        dayIdList.push(dayId);

        const placesRef = collection(
          db,
          `users/${userId}/plans/${planId}/days/${dayId}/places`
        );
        const placesQuery = query(placesRef, orderBy("order", "asc"));

        // 為每個天數設立監聽
        const unsub = onSnapshot(placesQuery, (placesSnap) => {
          dayPlacesMap[dayId] = placesSnap.docs.map((doc) => ({
            docId: doc.id,
            ...doc.data(),
          })) as PlaceWithDocId[];

          // 更新整包
          setDayPlacesData((prev) => ({
            ...prev,
            [dayId]: dayPlacesMap[dayId],
          }));
        });

        unsubList.push(unsub);
      }

      // 排序
      dayIdList.sort((a, b) => {
        const numA = parseInt(a.replace("day-", ""));
        const numB = parseInt(b.replace("day-", ""));
        return numA - numB;
      });

      setDaysListData(dayIdList);

      return () => unsubList.forEach((u) => u());
    });

    return () => {
      unsubPlan();
      unsubTemp();
      unsubDays();
    };
  }, [userId, planId]);

  return {
    info,
    tempData,
    daysListData,
    dayPlacesData,
  };
}

"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { db } from "@/library/firebase";
import { useSearchParams } from "next/navigation";
import {
  doc,
  getDoc,
  writeBatch,
  deleteDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SortableItem from "@/components/SortableItem";
import { useUser } from "@/context/UserContext";
import { notify } from "@/utilities/notify";
import { IconEdit } from "@tabler/icons-react";
import HandlePlan from "@/components/HandlePlan";
import ListItemCard from "@/components/ListItemCard";

interface PlanInput {
  name: string;
  startDate: string | null;
  endDate: string | null;
  note: string | null;
}

interface PlanInfo {
  name: string;
  startDate: string | null;
  endDate: string | null;
  note: string | null;
  isPublic: boolean;
  userName: string;
  createdAt: Timestamp;
  days?: any[];
}

interface EditPlan extends PlanInput {
  id: string;
}

type PlaceItem = {
  id: string;
  title: string;
  time?: string;
};

type Day = {
  id: string;
  title: string;
  date?: string;
  places: PlaceItem[];
};

export default function ItineraryEditor() {
  const user = useUser();
  const searchParams = useSearchParams();
  const planId = searchParams.get("id");
  const sensors = useSensors(useSensor(PointerSensor));
  const [days, setDays] = useState<Day[]>([]);
  const [tempPlaces, setTempPlaces] = useState<any[]>([]);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "day">("info");
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [editPlanOpened, { open: openEditPlan, close: closeEditPlan }] =
    useDisclosure(false);
  const [editPlanData, setEditPlanData] = useState<PlanInput | undefined>(
    undefined
  );
  const [editPlanId, setEditPlanId] = useState<string | null>(null);

  // 拖曳結束處理
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentItems = [...days];
    const activeDay = currentItems[activeDayIndex];
    if (!activeDay) return;

    const oldIndex = activeDay.places.findIndex((i) => i.id === active.id);
    const newIndex = activeDay.places.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    activeDay.places = arrayMove(activeDay.places, oldIndex, newIndex);
    setDays(currentItems);
  };

  // 新增天數
  const handleAddDay = async () => {
    const newIndex = days.length + 1;

    // 計算日期
    let dateStr = "";
    if (planInfo?.startDate) {
      const start = new Date(planInfo.startDate);
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + (newIndex - 1));

      // 轉成 YYYY-MM-DD 格式
      dateStr = currentDate.toISOString().split("T")[0];
    }

    const newDayId = `day-${newIndex}`;

    const newDay = {
      title: `第${newIndex}天`,
      date: dateStr,
    };

    if (user && planId) {
      const dayDocRef = doc(
        db,
        "users",
        user.uid,
        "plans",
        planId,
        "days",
        newDayId
      );
      try {
        await setDoc(dayDocRef, newDay); // 寫入 days 子集合
      } catch (error) {
        console.error("新增 day 發生錯誤：", error);
      }
    }
    const updatedDays = [
      ...days,
      { id: newDayId, title: newDay.title, date: dateStr, places: [] },
    ];
    setDays(updatedDays);
    setActiveTab("day");
    setActiveDayIndex(updatedDays.length - 1);
  };

  // 旅遊起始日修改 -> 更新days
  const adjustDaysDates = async (newStartDate: Date) => {
    const updatedDays = days.map((day, index) => {
      const adjustedDate = new Date(newStartDate);
      adjustedDate.setDate(newStartDate.getDate() + index);
      const dateStr = adjustedDate.toISOString().split("T")[0];
      return {
        ...day,
        date: dateStr,
      };
    });

    setDays(updatedDays);

    if (user && planId) {
      const batch = writeBatch(db);

      updatedDays.forEach((day) => {
        const dayRef = doc(
          db,
          "users",
          user.uid,
          "plans",
          planId,
          "days",
          day.id
        );
        batch.update(dayRef, { date: day.date });
      });

      try {
        await batch.commit();
        console.log("所有天數日期已更新");
      } catch (error) {
        console.error("更新天數日期失敗：", error);
      }
    }
  };

  // 移動景點到某天（刪除 + 新增）
  const movePlaceToDay = async (
    userId: string,
    planId: string,
    tempPlaceId: string,
    dayId: string
  ) => {
    const tempRef = doc(
      db,
      "users",
      userId,
      "plans",
      planId,
      "tempPlaces",
      tempPlaceId
    );
    const tempSnap = await getDoc(tempRef);

    if (!tempSnap.exists()) throw new Error("暫存景點不存在");

    const placeData = tempSnap.data();

    const targetRef = doc(
      db,
      "users",
      userId,
      "plans",
      planId,
      "days",
      dayId,
      "places",
      tempPlaceId
    );
    await setDoc(targetRef, placeData);
    await deleteDoc(tempRef); // 移動後刪除暫存
  };

  // 修改行程資訊
  const handleEditPlan = (plan: EditPlan) => {
    setEditPlanId(plan.id);
    setEditPlanData({
      name: plan.name,
      startDate: plan.startDate,
      endDate: plan.endDate,
      note: plan.note,
    });
    openEditPlan();
  };

  const handleUpdatePlan = async ({
    name,
    startDate,
    endDate,
    note,
  }: PlanInput) => {
    if (!user || !planId) {
      notify({ type: "error", message: "無法取得使用者或行程" });
      return;
    }

    setIsUpdatingPlan(true);
    try {
      const planRef = doc(db, `users/${user.uid}/plans/${planId}`);
      await updateDoc(planRef, {
        name,
        startDate: startDate || null,
        endDate: endDate || null,
        note: note?.trim() || null,
      });

      // 比對是否有更動 startDate
      const shouldAdjustDays =
        startDate && planInfo?.startDate && startDate !== planInfo.startDate;

      setPlanInfo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          name,
          startDate: startDate || null,
          endDate: endDate || null,
          note: note?.trim() || null,

          // 保留未改動的必填欄位
          isPublic: prev.isPublic,
          userName: prev.userName,
          createdAt: prev.createdAt,
          days: prev.days,
        };
      });
      // 如果有變更 startDate，就同步更新 days 日期
      if (shouldAdjustDays) {
        await adjustDaysDates(new Date(startDate!));
      }

      notify({ type: "success", message: "行程已更新！" });
      closeEditPlan();
    } catch (error) {
      console.error("更新行程失敗", error);
      notify({ type: "error", message: "更新行程失敗，請稍後再試！" });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // 新增景點到行程暫存(tempPlaces)
  const addPlaceToTemp = async (
    userId: string,
    planId: string,
    place: {
      name: string;
      address: string;
      location: { lat: number; lng: number };
      note?: string;
    }
  ) => {
    const ref = collection(db, "users", userId, "plans", planId, "tempPlaces");
    const docRef = await addDoc(ref, place);
    return docRef.id;
  };

  // 取得行程資訊與暫存景點
  const fetchPlanData = async (userId: string, planId: string) => {
    // 取得行程資料
    const planRef = doc(db, "users", userId, "plans", planId);
    const planSnap = await getDoc(planRef);
    let planInfo: PlanInfo | null = null;

    if (planSnap.exists()) {
      const data = planSnap.data();

      planInfo = {
        name: data.name ?? "",
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        note: data.note ?? null,
        isPublic: data.isPublic ?? false,
        userName: data.userName ?? "",
        createdAt: data.createdAt ?? Timestamp.now(),
        days: data.days ?? [],
      };
    }
    // 取得暫存景點
    const tempRef = collection(
      db,
      "users",
      userId,
      "plans",
      planId,
      "tempPlaces"
    );
    const tempSnap = await getDocs(tempRef);
    const tempPlaces = tempSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { planInfo, tempPlaces };
  };

  //   console.log(planInfo);

  // 取得行程天數與每天景點
  const getDaysWithPlaces = async (userId: string, planId: string) => {
    const daysRef = collection(db, "users", userId, "plans", planId, "days");
    const daysSnap = await getDocs(daysRef);

    const daysData = await Promise.all(
      daysSnap.docs.map(async (dayDoc) => {
        const dayId = dayDoc.id;
        const dayData = dayDoc.data();

        const placesRef = collection(
          db,
          "users",
          userId,
          "plans",
          planId,
          "days",
          dayId,
          "places"
        );
        const placesSnap = await getDocs(placesRef);
        const places: PlaceItem[] = placesSnap.docs.map((placeDoc) => {
          const data = placeDoc.data();
          return {
            id: placeDoc.id,
            title: data.title || "", // 防止undefined
            time: data.time || "",
          };
        });

        return {
          id: dayId,
          title: dayData.title || `未命名天數`, // 防止 title 缺失
          date: dayData.date || "",
          places,
        };
      })
    );

    return daysData;
  };

  const handleTimeChange = (itemId: string, newTime: string) => {
    const updatedDays = [...days];
    const day = updatedDays[activeDayIndex];
    if (!day) return;

    const index = day.places.findIndex((i) => i.id === itemId);
    if (index === -1) return;

    day.places[index] = {
      ...day.places[index],
      time: newTime,
    };

    setDays(updatedDays);
  };

  // 刪除景點
  const deletePlace = async (placeId: string) => {
    if (!user || !planId) return;

    // 暫存區
    if (activeTab === "info") {
      try {
        const tempPlaceRef = doc(
          db,
          "users",
          user.uid,
          "plans",
          planId,
          "tempPlaces",
          placeId
        );
        await deleteDoc(tempPlaceRef);

        const updatedTemp = tempPlaces.filter((p) => p.id !== placeId);
        setTempPlaces(updatedTemp);

        notify({ type: "success", message: "已從暫存清單刪除" });
      } catch (error) {
        console.error("刪除暫存景點失敗：", error);
        notify({ type: "error", message: "刪除失敗，請稍後再試！" });
      }
      return;
    }

    // day區
    const day = days[activeDayIndex];
    if (!day) return;

    try {
      const placeRef = doc(
        db,
        "users",
        user.uid,
        "plans",
        planId,
        "days",
        day.id,
        "places",
        placeId
      );
      await deleteDoc(placeRef);

      const updatedDays = [...days];
      updatedDays[activeDayIndex].places = updatedDays[
        activeDayIndex
      ].places.filter((place) => place.id !== placeId);
      setDays(updatedDays);

      notify({ type: "success", message: "景點已刪除" });
    } catch (error) {
      console.error("刪除景點失敗：", error);
      notify({ type: "error", message: "刪除景點失敗，請稍後再試！" });
    }
  };

  // 修改景點備註
  const handleUpdateNote = async (placeId: string, newNote: string | null) => {
    if (!user || !planId) return;

    // 暫存區
    if (activeTab === "info") {
      const updatedTempPlaces = tempPlaces.map((place) =>
        place.id === placeId ? { ...place, note: newNote } : place
      );
      setTempPlaces(updatedTempPlaces);

      const noteRef = doc(
        db,
        "users",
        user.uid,
        "plans",
        planId,
        "tempPlaces",
        placeId
      );

      try {
        await updateDoc(noteRef, { note: newNote });
        notify({ type: "success", message: "景點備註已更新" });
      } catch (error: any) {
        notify({ type: "error", message: "更新備註失敗" });
        console.error("更新備註錯誤", error);
      }
      return;
    }

    // day區
    const day = days[activeDayIndex];
    if (!day) return;

    try {
      const placeRef = doc(
        db,
        "users",
        user.uid,
        "plans",
        planId,
        "days",
        day.id,
        "places",
        placeId
      );
      await updateDoc(placeRef, { note: newNote });

      const updatedDays = [...days];
      updatedDays[activeDayIndex].places = updatedDays[
        activeDayIndex
      ].places.map((place) =>
        place.id === placeId ? { ...place, note: newNote } : place
      );
      setDays(updatedDays);

      notify({ type: "success", message: "備註已更新" });
    } catch (error) {
      console.error("更新備註失敗：", error);
      notify({ type: "error", message: "備註更新失敗，請稍後再試！" });
    }
  };

  useEffect(() => {
    if (!user || !planId) return;

    const fetchAll = async () => {
      const data = await fetchPlanData(user.uid, planId);
      if (data) {
        setPlanInfo(data.planInfo);
        setTempPlaces(data.tempPlaces);
      }
      const daysData = await getDaysWithPlaces(user.uid, planId);
      setDays(daysData);
    };

    fetchAll();
  }, [user, planId]);

  // 待確認
  useEffect(() => {
    if (activeTab === "day" && user && planId) {
      getDaysWithPlaces(user.uid, planId).then((updatedDays) => {
        setDays(updatedDays);
      });
    }
  }, [activeTab]);

  return (
    <div className="basis-1/4 flex flex-col h-full">
      <Modal
        opened={editPlanOpened}
        onClose={closeEditPlan}
        title="修改行程資訊"
        size="xs"
        centered
      >
        <HandlePlan
          onClose={closeEditPlan}
          onSubmit={handleUpdatePlan}
          isLoading={isUpdatingPlan}
          defaultData={
            editPlanData
              ? { ...editPlanData, note: editPlanData.note ?? "" }
              : undefined
          }
          mode="edit"
        ></HandlePlan>
      </Modal>
      {/* Tab Buttons */}
      <div className="border-b px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 flex-nowrap w-max">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === "info"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            行程總覽
          </button>

          {days.map((day, index) => (
            <button
              key={day.id}
              onClick={() => {
                setActiveTab("day");
                setActiveDayIndex(index);
              }}
              className={`px-3 py-1 text-sm rounded ${
                activeTab === "day" && activeDayIndex === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {day.title}
            </button>
          ))}
          <button
            onClick={handleAddDay}
            className="ml-auto text-blue-500 hover:text-blue-700 font-bold text-xl"
            aria-label="新增天數"
          >
            ＋
          </button>
        </div>
      </div>

      {/* 內容區 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "info" ? (
          <div className="border rounded-xl p-4 shadow-sm bg-white">
            {planInfo ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
                  <span>{planInfo.name || "未命名行程"}</span>
                  <Button
                    size="compact-xs"
                    variant="outline"
                    color="#2C3E50"
                    className="hover:bg-red-600 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPlan({ id: planId!, ...planInfo });
                    }}
                  >
                    修改行程
                    <IconEdit size={20} />
                  </Button>
                </div>

                <div className="text-gray-600">
                  <span className="font-medium">旅遊日期：</span>
                  {planInfo.startDate && planInfo.endDate
                    ? `${planInfo.startDate} ～ ${planInfo.endDate}`
                    : "日期未定"}
                </div>

                <div className="text-gray-600">
                  <span className="font-medium">備註：</span>
                  {planInfo.note ? (
                    planInfo.note
                  ) : (
                    <span className="text-gray-400">--尚無備註--</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">載入中或無行程資訊...</p>
            )}

            <h3 className="mt-6 text-lg font-semibold text-gray-800">
              暫存景點
            </h3>
            <div className="flex flex-col items-center gap-4 justify-center">
              {tempPlaces.length > 0 ? (
                tempPlaces.map((place) => (
                  <ListItemCard
                    key={place.id} //Firestore 文件ID
                    item={{
                      ...place,
                      note: place.note || null,
                      address: place.address || "",
                      location: place.location || { lat: 0, lng: 0 },
                    }}
                    onDelete={deletePlace}
                    onUpdateNote={handleUpdateNote}
                  />
                ))
              ) : (
                <div className="mt-10 text-center text-gray-500">
                  尚無安排任何地點
                </div>
              )}
            </div>
          </div>
        ) : days[activeDayIndex] ? (
          <>
            <h2 className="text-lg font-bold mb-2 text-center">
              {days[activeDayIndex].title} · {days[activeDayIndex].date || ""}
            </h2>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={days[activeDayIndex].places.map((places) => places.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul>
                  {days[activeDayIndex].places.length > 0 ? (
                    days[activeDayIndex].places.map((places, index) => (
                      <SortableItem
                        key={places.id}
                        item={{
                          ...places,
                          time: places.time ?? "", // 若為 undefined 則給 ""
                        }}
                        index={index}
                        onTimeChange={handleTimeChange}
                      />
                    ))
                  ) : (
                    <li>尚無景點，請新增</li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          </>
        ) : (
          <p>尚無天數資料</p>
        )}
      </div>
    </div>
  );
}

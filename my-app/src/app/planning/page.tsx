"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useUserLists } from "@/hooks/useUserLists";
import { useListItems } from "@/hooks/useListItems";
import { usePlanOverview } from "@/hooks/usePlanOverview";
import { useSearchParams } from "next/navigation";
import { db } from "@/library/firebase";
import { notify } from "@/utilities/notify";
import {
  IconXboxXFilled,
  IconNotes,
  IconEdit,
  IconGripVertical,
  IconTrash,
  IconCalendarCode,
  IconPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import {
  getDocs,
  getDoc,
  collection,
  setDoc,
  query,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
  FieldValue,
} from "firebase/firestore";
import {
  Button,
  Group,
  Select,
  Loader,
  Textarea,
  Text,
  Modal,
} from "@mantine/core";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MapWithPlaceAutocomplete from "@/components/Map";
import HandlePlan from "@/components/HandlePlan";

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

interface PlaceItemWithActions {
  placeData: PlaceWithDocId; //儲存的地點資料
  onDelete: (
    docId: string,
    currentContainer: string,
    onSuccess: () => void
  ) => void;
  onUpdateNote: (
    docId: string,
    newNote: string | null,
    currentContainer: string,
    onSuccess: () => void
  ) => void;
}

interface PlanInput {
  name: string;
  startDate: string | null;
  endDate: string | null;
  note: string | null;
}

interface PlanInfo extends PlanInput {
  days?: any[];
}

export default function PlanningPage() {
  // 狀態管理
  const user = useAuthCheck();
  const searchParams = useSearchParams();
  const planId = searchParams.get("id");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [daysList, setDaysList] = useState<string[]>([]); // 儲存天數列表
  const [isManagingDays, setIsManagingDays] = useState(false);

  // 清單相關狀態
  const { lists, isFetchingLists } = useUserLists(user?.uid ?? null);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const { places: selectedListPlaces, isLoadingListItems } = useListItems(
    user?.uid ?? null,
    selectedList
  );
  //   const [isLoadingListItems, setIsLoadingListItems] = useState(false);
  const [sidebarPlaces, setSidebarPlaces] = useState<PlaceWithDocId[]>([]);

  // 行程相關狀態
  const {
    info: initPlanInfo,
    tempData: initTempPlaces,
    daysListData: initDayList,
    dayPlacesData: initPlacesData,
  } = usePlanOverview(user?.uid ?? null, planId);

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [tempPlaces, setTempPlaces] = useState<PlaceWithDocId[]>([]);
  const [dayPlaces, setDayPlaces] = useState<{
    [key: string]: PlaceWithDocId[];
  }>({});
  const [activeTab, setActiveTab] = useState("temp");

  // 拖拽相關狀態
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<PlaceWithDocId | null>(null);

  // 編輯行程相關狀態
  const [editPlanOpened, { open: openEditPlan, close: closeEditPlan }] =
    useDisclosure(false);
  const [editPlanData, setEditPlanData] = useState<PlanInput | undefined>(
    undefined
  );

  // 傳感器設置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 更新行程資訊
  const handleUpdatePlan = async (planInput: PlanInput) => {
    if (!user || !planId) {
      notify({ type: "error", message: "無法取得使用者或行程" });
      return;
    }

    setIsUpdatingPlan(true);

    try {
      const planRef = doc(db, `users/${user.uid}/plans/${planId}`);
      await updateDoc(planRef, {
        name: planInput.name,
        startDate: planInput.startDate || null,
        endDate: planInput.endDate || null,
        note: planInput.note?.trim() || null,
      });

      setPlanInfo((prev) =>
        prev
          ? {
              ...prev,
              name: planInput.name,
              startDate: planInput.startDate || null,
              endDate: planInput.endDate || null,
              note: planInput.note?.trim() || null,
            }
          : null
      );

      notify({ type: "success", message: "行程已更新！" });
      closeEditPlan();
    } catch (error) {
      console.error("更新行程失敗", error);
      notify({ type: "error", message: "更新行程失敗，請稍後再試！" });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // 處理清單選擇
  const handleSelectList = (listId: string | null) => {
    setSelectedList(listId);
  };

  // 更新備註
  const handleUpdateNote = async (
    docId: string,
    newNote: string | null,
    container: string,
    onSuccess?: () => void
  ) => {
    try {
      let itemRef;

      if (container === "sidebar") {
        itemRef = doc(
          db,
          `users/${userId}/lists/${selectedList}/places/${docId}`
        );
      } else if (container === "temp") {
        itemRef = doc(
          db,
          `users/${userId}/plans/${planId}/tempPlaces/${docId}`
        );
      } else if (container.startsWith("day-")) {
        itemRef = doc(
          db,
          `users/${userId}/plans/${planId}/days/${container}/places/${docId}`
        );
      }

      if (itemRef) {
        await updateDoc(itemRef, { note: newNote });
      }

      if (container === "sidebar") {
        setSidebarPlaces((prev) =>
          prev
            ? prev.map((item) =>
                item.docId === docId ? { ...item, note: newNote } : item
              )
            : prev
        );
      } else if (container === "temp") {
        setTempPlaces((prev) =>
          prev.map((item) =>
            item.docId === docId ? { ...item, note: newNote } : item
          )
        );
      } else if (container.startsWith("day-")) {
        setDayPlaces((prev) => ({
          ...prev,
          [container]: prev[container].map((item) =>
            item.docId === docId ? { ...item, note: newNote } : item
          ),
        }));
      }
      onSuccess?.();
      notify({ type: "success", message: "備註已更新!" });
    } catch (error) {
      console.error("更新備註失敗", error);
      notify({ type: "error", message: "更新備註失敗，請稍後再試！" });
    }
  };

  // 刪除景點
  const handleDelete = async (
    docId: string,
    container: string,
    onSuccess?: () => void
  ) => {
    try {
      let itemRef;

      if (container === "sidebar") {
        itemRef = doc(
          db,
          `users/${userId}/lists/${selectedList}/places/${docId}`
        );
      } else if (container === "temp") {
        itemRef = doc(
          db,
          `users/${userId}/plans/${planId}/tempPlaces/${docId}`
        );
      } else if (container.startsWith("day-")) {
        itemRef = doc(
          db,
          `users/${userId}/plans/${planId}/days/${container}/places/${docId}`
        );
      }

      if (itemRef) {
        await deleteDoc(itemRef);
      }

      if (container === "sidebar") {
        setSidebarPlaces(
          (prev) => prev?.filter((item) => item.docId !== docId) || []
        );
      } else if (container === "temp") {
        setTempPlaces(
          (prev) => prev?.filter((item) => item.docId !== docId) || []
        );
      } else if (container.startsWith("day-")) {
        setDayPlaces((prev) => ({
          ...prev,
          [container]:
            prev[container]?.filter((item) => item.docId !== docId) || [],
        }));
      }
      onSuccess?.();
      notify({ type: "success", message: "景點已刪除!" });
    } catch (error) {
      console.error("景點刪除失敗", error);
      notify({ type: "error", message: "刪除失敗，請稍後再試！" });
    }
  };

  // 管理天數 - 新增
  const addNewDay = async () => {
    if (!user || !planId) return;

    setIsManagingDays(true);
    try {
      // 獲取現有天數的數字
      const existingDayNumbers = daysList
        .map((dayId) => parseInt(dayId.replace("day-", "")))
        .filter((num) => !isNaN(num))
        .sort((a, b) => a - b); // 排序以便找到缺失的數字

      let newDayNumber = 1;

      // 找到第一個缺失的數字，如果沒有缺失則使用最大值+1
      if (existingDayNumbers.length === 0) {
        newDayNumber = 1;
      } else {
        // 檢查是否有缺失的數字
        let foundGap = false;
        for (let i = 0; i < existingDayNumbers.length; i++) {
          const expectedNumber = i + 1;
          if (existingDayNumbers[i] !== expectedNumber) {
            newDayNumber = expectedNumber;
            foundGap = true;
            break;
          }
        }

        // 如果沒有缺失的數字，則使用最大值+1
        if (!foundGap) {
          newDayNumber = Math.max(...existingDayNumbers) + 1;
        }
      }

      const newDayId = `day-${newDayNumber}`;

      // 在 Firestore 中創建新天數文件
      const dayRef = doc(
        db,
        `users/${user.uid}/plans/${planId}/days`,
        newDayId
      );
      await setDoc(dayRef, {
        dayId: newDayId,
        title: `第 ${newDayNumber} 天`,
        date: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setDaysList((prev) => [...prev, newDayId].sort());
      setDayPlaces((prev) => ({
        ...prev,
        [newDayId]: [],
      }));

      // 切換到新建的天數頁面
      setActiveTab(newDayId);

      notify({ type: "success", message: `已新增第 ${newDayNumber} 天` });
    } catch (error) {
      console.error("新增天數失敗:", error);
      notify({ type: "error", message: "新增天數失敗，請稍後再試！" });
    } finally {
      setIsManagingDays(false);
    }
  };

  // 管理天數 - 移除
  const removeDay = async (dayId: string) => {
    if (!user || !planId) return;

    setIsManagingDays(true);
    try {
      // 檢查該天是否有景點
      const dayPlacesCount = dayPlaces[dayId]?.length || 0;

      if (dayPlacesCount > 0) {
        // 如果有景點，詢問是否要移動到暫存
        const shouldMoveToTemp = window.confirm(
          `第 ${dayId.replace(
            "day-",
            ""
          )} 天還有 ${dayPlacesCount} 個景點，是否要移動到暫存區？`
        );

        if (shouldMoveToTemp) {
          // 將該天的所有景點移動到暫存
          const placesToMove = dayPlaces[dayId] || [];

          // 取得現有暫存區中的 place.id 列表，避免重複
          const existingTempPlaceIds = new Set(
            tempPlaces.map((place) => place?.id)
          );

          // 過濾掉已存在於暫存區的景點
          const uniquePlacesToMove = placesToMove.filter((place) => {
            const placeId = place.id;
            return !existingTempPlaceIds.has(placeId);
          });

          // 記錄被過濾掉的重複景點數量
          const duplicateCount =
            placesToMove.length - uniquePlacesToMove.length;

          const batch = writeBatch(db);

          // 刪除天數中的所有景點（包括重複的）
          for (const place of placesToMove) {
            const dayPlaceRef = doc(
              db,
              `users/${user.uid}/plans/${planId}/days/${dayId}/places`,
              place.docId
            );
            batch.delete(dayPlaceRef);
          }

          // 只添加不重複的景點到暫存
          for (let i = 0; i < uniquePlacesToMove.length; i++) {
            const place = uniquePlacesToMove[i];
            const tempPlaceRef = doc(
              db,
              `users/${user.uid}/plans/${planId}/tempPlaces`,
              place.docId
            );
            batch.set(tempPlaceRef, {
              ...place,
              order: tempPlaces.length + i,
              updatedAt: serverTimestamp(),
            });
          }

          await batch.commit();

          setTempPlaces((prev) => [
            ...prev,
            ...placesToMove.map((place, index) => ({
              ...place,
              order: prev.length + index,
            })),
          ]);

          if (duplicateCount > 0) {
            notify({
              type: "info",
              message: `已移動 ${uniquePlacesToMove.length} 個景點到暫存區，${duplicateCount} 個重複景點已略過`,
            });
          }
        }
      }

      // 刪除天數文件（自動刪除子集合）
      const dayRef = doc(db, `users/${user.uid}/plans/${planId}/days`, dayId);
      await deleteDoc(dayRef);

      // 如果該天數有景點子集合，需要手動刪除
      const placesRef = collection(
        db,
        `users/${user.uid}/plans/${planId}/days/${dayId}/places`
      );
      const placesSnap = await getDocs(placesRef);
      const deleteBatch = writeBatch(db);

      placesSnap.docs.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });

      if (placesSnap.docs.length > 0) {
        await deleteBatch.commit();
      }

      setDaysList((prev) => prev.filter((id) => id !== dayId));
      setDayPlaces((prev) => {
        const newDayPlaces = { ...prev };
        delete newDayPlaces[dayId];
        return newDayPlaces;
      });

      // 如果刪除的是當前頁面，切換到暫存頁面
      if (activeTab === dayId) {
        setActiveTab("temp");
      }

      const dayNumber = dayId.replace("day-", "");
      notify({ type: "success", message: `已刪除第 ${dayNumber} 天` });
    } catch (error) {
      console.error("刪除天數失敗:", error);
      notify({ type: "error", message: "刪除天數失敗，請稍後再試！" });
    } finally {
      setIsManagingDays(false);
    }
  };

  // 拖拽開始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // 尋找被拖拽的項目
    let foundItem: PlaceWithDocId | null = null;

    // 在 sidebar 中尋找
    foundItem =
      sidebarPlaces.find((place) => place.docId === active.id) || null;

    // 在 tempPlaces 中尋找
    if (!foundItem) {
      foundItem = tempPlaces.find((place) => place.docId === active.id) || null;
    }

    // 在 dayPlaces 中尋找
    if (!foundItem) {
      for (const dayKey of Object.keys(dayPlaces)) {
        foundItem =
          dayPlaces[dayKey].find((place) => place.docId === active.id) || null;
        if (foundItem) break;
      }
    }

    setActiveItem(foundItem);
  };

  // 拖拽結束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over || !user || !planId) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 確定拖拽的來源和目標
    const sourceContainer = getContainerByItemId(activeId);
    const targetContainer = getContainerById(overId);

    if (!sourceContainer || !targetContainer) return;

    try {
      // 從 sidebar 拖拽
      if (sourceContainer === "sidebar") {
        const draggedItem = sidebarPlaces.find(
          (item) => item.docId === activeId
        );
        if (!draggedItem) return;

        if (targetContainer === "temp") {
          // 添加到暫存景點
          await moveFromSidebarToTemp(draggedItem);
        } else if (targetContainer.startsWith("day-")) {
          // 添加到特定天數
          await moveFromSidebarToDay(draggedItem, targetContainer);
        } else if (targetContainer === "sidebar") {
          // 在 sidebar 內重新排序
          await reorderInSidebar(activeId, overId);
        }
      }
      // 從 tempPlaces 拖拽
      else if (sourceContainer === "temp") {
        const draggedItem = tempPlaces.find((item) => item.docId === activeId);
        if (!draggedItem) return;

        if (targetContainer === "sidebar") {
          // 從暫存移動回 sidebar
          await moveFromTempToSidebar(draggedItem);
        } else if (targetContainer.startsWith("day-")) {
          // 從暫存移動到天數
          await moveFromTempToDay(draggedItem, targetContainer);
        } else if (targetContainer === "temp") {
          // 在暫存內重新排序
          await reorderInTemp(activeId, overId);
        }
      }
      // 從天數拖拽
      else if (sourceContainer.startsWith("day-")) {
        const draggedItem = dayPlaces[sourceContainer]?.find(
          (item) => item.docId === activeId
        );
        if (!draggedItem) return;

        if (targetContainer === "sidebar") {
          // 從天數移動回 sidebar
          await moveFromDayToSidebar(draggedItem, sourceContainer);
        } else if (targetContainer === "temp") {
          // 從天數移動到暫存
          await moveFromDayToTemp(draggedItem, sourceContainer);
        } else if (
          targetContainer.startsWith("day-") &&
          targetContainer !== sourceContainer
        ) {
          // 從一個天數移動到另一個天數
          await moveBetweenDays(draggedItem, sourceContainer, targetContainer);
        } else if (targetContainer === sourceContainer) {
          // 在同一天數內重新排序
          await reorderInDay(activeId, overId, sourceContainer);
        }
      }
    } catch (error) {
      console.error("拖拽操作失敗:", error);
      notify({ type: "error", message: "操作失敗，請稍後再試！" });
    }
  };

  // 根據項目ID獲取容器
  const getContainerByItemId = (itemId: string): string | null => {
    if (sidebarPlaces.some((item) => item.docId === itemId)) return "sidebar";
    if (tempPlaces.some((item) => item.docId === itemId)) return "temp";

    for (const dayKey of Object.keys(dayPlaces)) {
      if (dayPlaces[dayKey].some((item) => item.docId === itemId)) {
        return dayKey;
      }
    }

    return null;
  };

  // 根據容器ID獲取容器類型
  const getContainerById = (containerId: string): string | null => {
    if (containerId === "sidebar-container") return "sidebar";
    if (containerId === "temp-container") return "temp";
    if (containerId.startsWith("day-") && containerId.endsWith("-container")) {
      return containerId.replace("-container", "");
    }

    // 如果是拖拽到項目上，需要找到該項目所在的容器
    const itemContainer = getContainerByItemId(containerId);
    return itemContainer;
  };

  // 從 sidebar 移動到暫存
  const moveFromSidebarToTemp = async (item: PlaceWithDocId) => {
    // 檢查是否已存在於暫存中
    const existsInTemp = tempPlaces.some((place) => place.id === item.id);
    if (existsInTemp) {
      notify({ type: "warning", message: "該景點已在暫存中！" });
      return false;
    }

    const batch = writeBatch(db);

    // 從 sidebar 刪除項目
    const sidebarPlaceRef = doc(
      db,
      `users/${user!.uid}/lists/${selectedList}/places`,
      item.docId
    );
    batch.delete(sidebarPlaceRef);

    // 添加到暫存
    const newOrder = tempPlaces.length;
    const tempPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/tempPlaces`,
      item.docId
    );
    batch.set(tempPlaceRef, {
      ...item,
      order: newOrder,
      updatedAt: serverTimestamp(),
    });

    // 重新排序 sidebar 中剩餘的項目
    const remainingSidebarPlaces = sidebarPlaces.filter(
      (place) => place.docId !== item.docId
    );
    remainingSidebarPlaces.forEach((place, index) => {
      const ref = doc(
        db,
        `users/${user!.uid}/lists/${selectedList}/places`,
        place.docId
      );
      batch.update(ref, { order: index });
    });

    await batch.commit();

    setSidebarPlaces(
      remainingSidebarPlaces.map((place, index) => ({ ...place, order: index }))
    );
    setTempPlaces((prev) => [...prev, { ...item, order: newOrder }]);
    return true;
  };

  // 從 sidebar 移動到天數
  const moveFromSidebarToDay = async (item: PlaceWithDocId, dayId: string) => {
    // 檢查是否已存在於該天數中
    const currentDayPlaces = dayPlaces[dayId] || [];
    const existsInDay = currentDayPlaces.some(
      (place) => place.docId === item.docId
    );
    if (existsInDay) {
      notify({
        type: "warning",
        message: `該景點已在第 ${dayId.replace("day-", "")} 天中！`,
      });
      return false;
    }

    const batch = writeBatch(db);

    // 從 sidebar 刪除項目
    const sidebarPlaceRef = doc(
      db,
      `users/${user!.uid}/lists/${selectedList}/places`,
      item.docId
    );
    batch.delete(sidebarPlaceRef);

    // 添加到天數
    const newOrder = currentDayPlaces.length;
    const dayPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/days/${dayId}/places`,
      item.docId
    );
    batch.set(dayPlaceRef, {
      ...item,
      order: newOrder,
      updatedAt: serverTimestamp(),
    });

    // 重新排序 sidebar 中剩餘的項目
    const remainingSidebarPlaces = sidebarPlaces.filter(
      (place) => place.docId !== item.docId
    );
    remainingSidebarPlaces.forEach((place, index) => {
      const ref = doc(
        db,
        `users/${user!.uid}/lists/${selectedList}/places`,
        place.docId
      );
      batch.update(ref, { order: index });
    });

    await batch.commit();

    setSidebarPlaces(
      remainingSidebarPlaces.map((place, index) => ({ ...place, order: index }))
    );
    setDayPlaces((prev) => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), { ...item, order: newOrder }],
    }));
    return true;
  };

  // 在 sidebar 內重新排序
  const reorderInSidebar = async (activeId: string, overId: string) => {
    if (!selectedList || !user) return;

    const newSidebarPlaces = [...sidebarPlaces];
    const activeIndex = newSidebarPlaces.findIndex(
      (item) => item.docId === activeId
    );
    const overIndex = newSidebarPlaces.findIndex(
      (item) => item.docId === overId
    );

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      const [removed] = newSidebarPlaces.splice(activeIndex, 1);
      newSidebarPlaces.splice(overIndex, 0, removed);

      // 更新所有項目的順序
      const batch = writeBatch(db);
      newSidebarPlaces.forEach((item, index) => {
        const ref = doc(
          db,
          `users/${user.uid}/lists/${selectedList}/places`,
          item.docId
        );
        batch.update(ref, { order: index });
      });

      await batch.commit();
      setSidebarPlaces(
        newSidebarPlaces.map((item, index) => ({ ...item, order: index }))
      );
    }
  };

  // 從暫存移動到天數
  const moveFromTempToDay = async (item: PlaceWithDocId, dayId: string) => {
    // 檢查是否已存在於該天數中
    const currentDayPlaces = dayPlaces[dayId] || [];
    const existsInDay = currentDayPlaces.some(
      (place) => place.docId === item.docId
    );
    if (existsInDay) {
      notify({
        type: "warning",
        message: `該景點已在第 ${dayId.replace("day-", "")} 天中！`,
      });
      return false;
    }

    const batch = writeBatch(db);

    // 刪除暫存中的項目
    const tempPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/tempPlaces`,
      item.docId
    );
    batch.delete(tempPlaceRef);

    // 添加到天數
    const newOrder = currentDayPlaces.length;
    const dayPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/days/${dayId}/places`,
      item.docId
    );
    batch.set(dayPlaceRef, {
      ...item,
      order: newOrder,
      updatedAt: serverTimestamp(),
    });

    // 重新排序暫存中剩餘的項目
    const remainingTempPlaces = tempPlaces.filter(
      (place) => place.docId !== item.docId
    );
    remainingTempPlaces.forEach((place, index) => {
      const ref = doc(
        db,
        `users/${user!.uid}/plans/${planId}/tempPlaces`,
        place.docId
      );
      batch.update(ref, { order: index });
    });

    await batch.commit();

    setTempPlaces(
      remainingTempPlaces.map((place, index) => ({ ...place, order: index }))
    );
    setDayPlaces((prev) => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), { ...item, order: newOrder }],
    }));
    return true;
  };

  // 從暫存移動回 sidebar
  const moveFromTempToSidebar = async (item: PlaceWithDocId) => {
    // 檢查是否已存在於 sidebar 中
    const existsInSidebar = sidebarPlaces.some((place) => place.id === item.id);
    if (existsInSidebar) {
      notify({ type: "warning", message: "該景點已在景點清單中！" });
      return false;
    }

    const batch = writeBatch(db);

    // 刪除暫存中的項目
    const tempPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/tempPlaces`,
      item.docId
    );
    batch.delete(tempPlaceRef);

    // 添加到 sidebar
    const newOrder = sidebarPlaces.length;
    const sidebarPlaceRef = doc(
      db,
      `users/${user!.uid}/lists/${selectedList}/places`,
      item.docId
    );
    batch.set(sidebarPlaceRef, {
      ...item,
      order: newOrder,
      updatedAt: serverTimestamp(),
    });

    // 重新排序暫存中剩餘的項目
    const remainingTempPlaces = tempPlaces.filter(
      (place) => place.docId !== item.docId
    );
    remainingTempPlaces.forEach((place, index) => {
      const ref = doc(
        db,
        `users/${user!.uid}/plans/${planId}/tempPlaces`,
        place.docId
      );
      batch.update(ref, { order: index });
    });

    await batch.commit();

    setTempPlaces(
      remainingTempPlaces.map((place, index) => ({ ...place, order: index }))
    );
    setSidebarPlaces((prev) => [...prev, { ...item, order: newOrder }]);
    return true;
  };

  // 從天數移動到暫存
  const moveFromDayToTemp = async (item: PlaceWithDocId, dayId: string) => {
    // 檢查是否已存在於暫存中
    const existsInTemp = tempPlaces.some((place) => place.id === item.id);
    if (existsInTemp) {
      notify({ type: "warning", message: "該景點已在暫存中！" });
      return false;
    }

    const batch = writeBatch(db);

    // 刪除天數中的項目
    const dayPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/days/${dayId}/places`,
      item.docId
    );
    batch.delete(dayPlaceRef);

    // 添加到暫存
    const newOrder = tempPlaces.length;
    const tempPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/tempPlaces`,
      item.docId
    );
    batch.set(tempPlaceRef, {
      ...item,
      order: newOrder,
      updatedAt: serverTimestamp(),
    });

    // 重新排序該天數中剩餘的項目
    const remainingDayPlaces = dayPlaces[dayId].filter(
      (place) => place.docId !== item.docId
    );
    remainingDayPlaces.forEach((place, index) => {
      const ref = doc(
        db,
        `users/${user!.uid}/plans/${planId}/days/${dayId}/places`,
        place.docId
      );
      batch.update(ref, { order: index });
    });

    await batch.commit();

    setDayPlaces((prev) => ({
      ...prev,
      [dayId]: remainingDayPlaces.map((place, index) => ({
        ...place,
        order: index,
      })),
    }));
    setTempPlaces((prev) => [...prev, { ...item, order: newOrder }]);
    return true;
  };

  // 從天數移動回 sidebar
  const moveFromDayToSidebar = async (item: PlaceWithDocId, dayId: string) => {
    // 檢查是否已存在於 sidebar 中
    const existsInSidebar = sidebarPlaces.some((place) => place.id === item.id); //移回清單，檢查place id是否重覆
    if (existsInSidebar) {
      notify({ type: "warning", message: "該景點已在景點清單中！" });
      return false;
    }

    const batch = writeBatch(db);

    // 刪除天數中的項目
    const dayPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/days/${dayId}/places`,
      item.docId
    );
    batch.delete(dayPlaceRef);

    // 添加到 sidebar
    const newOrder = sidebarPlaces.length;
    const sidebarPlaceRef = doc(
      db,
      `users/${user!.uid}/lists/${selectedList}/places`,
      item.docId
    );
    batch.set(sidebarPlaceRef, {
      ...item,
      order: newOrder,
      updatedAt: serverTimestamp(),
    });

    // 重新排序該天數中剩餘的項目
    const remainingDayPlaces = dayPlaces[dayId].filter(
      (place) => place.docId !== item.docId
    );
    remainingDayPlaces.forEach((place, index) => {
      const ref = doc(
        db,
        `users/${user!.uid}/plans/${planId}/days/${dayId}/places`,
        place.docId
      );
      batch.update(ref, { order: index });
    });

    await batch.commit();

    setDayPlaces((prev) => ({
      ...prev,
      [dayId]: remainingDayPlaces.map((place, index) => ({
        ...place,
        order: index,
      })),
    }));
    setSidebarPlaces((prev) => [...prev, { ...item, order: newOrder }]);
    return true;
  };

  // 在天數間移動
  const moveBetweenDays = async (
    item: PlaceWithDocId,
    sourceDayId: string,
    targetDayId: string
  ) => {
    // 檢查是否已存在於目標天數中
    const targetDayPlaces = dayPlaces[targetDayId] || [];
    const existsInTargetDay = targetDayPlaces.some(
      (place) => place.docId === item.docId
    );
    if (existsInTargetDay) {
      notify({
        type: "warning",
        message: `該景點已在第 ${targetDayId.replace("day-", "")} 天中！`,
      });
      return false;
    }

    const batch = writeBatch(db);

    // 從來源天數刪除
    const sourceDayPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/days/${sourceDayId}/places`,
      item.docId
    );
    batch.delete(sourceDayPlaceRef);

    // 添加到目標天數
    const newOrder = targetDayPlaces.length;
    const targetDayPlaceRef = doc(
      db,
      `users/${user!.uid}/plans/${planId}/days/${targetDayId}/places`,
      item.docId
    );
    batch.set(targetDayPlaceRef, {
      ...item,
      order: newOrder,
      updatedAt: serverTimestamp(),
    });

    // 重新排序來源天數中剩餘的項目
    const remainingSourceDayPlaces = dayPlaces[sourceDayId].filter(
      (place) => place.docId !== item.docId
    );
    remainingSourceDayPlaces.forEach((place, index) => {
      const ref = doc(
        db,
        `users/${user!.uid}/plans/${planId}/days/${sourceDayId}/places`,
        place.docId
      );
      batch.update(ref, { order: index });
    });

    await batch.commit();

    setDayPlaces((prev) => ({
      ...prev,
      [sourceDayId]: remainingSourceDayPlaces.map((place, index) => ({
        ...place,
        order: index,
      })),
      [targetDayId]: [
        ...(prev[targetDayId] || []),
        { ...item, order: newOrder },
      ],
    }));
    return true;
  };

  // 容器間移動處理
  const handleMove = async (
    itemId: string,
    fromContainer: string,
    toContainer: string
  ) => {
    if (!user || !planId) return;

    if (toContainer === "sidebar" && selectedList === null) {
      notify({ type: "warning", message: "請先選擇一個清單！" });
      return;
    }

    try {
      // 找到要移動的項目
      let itemToMove: PlaceWithDocId | null = null;
      let success = false;

      if (fromContainer === "sidebar") {
        itemToMove =
          sidebarPlaces.find((item) => item.docId === itemId) || null;
      } else if (fromContainer === "temp") {
        itemToMove = tempPlaces.find((item) => item.docId === itemId) || null;
      } else if (fromContainer.startsWith("day-")) {
        itemToMove =
          dayPlaces[fromContainer]?.find((item) => item.docId === itemId) ||
          null;
      }

      if (!itemToMove) return;

      // 執行移動
      if (fromContainer === "sidebar" && toContainer === "temp") {
        // 從 sidebar 移動到暫存
        success = await moveFromSidebarToTemp(itemToMove);
      } else if (
        fromContainer === "sidebar" &&
        toContainer.startsWith("day-")
      ) {
        // 從 sidebar 移動到天數
        success = await moveFromSidebarToDay(itemToMove, toContainer);
      } else if (fromContainer === "temp" && toContainer === "sidebar") {
        // 從暫存移動回 sidebar
        success = await moveFromTempToSidebar(itemToMove);
      } else if (fromContainer === "temp" && toContainer.startsWith("day-")) {
        // 從暫存移動到天數
        success = await moveFromTempToDay(itemToMove, toContainer);
      } else if (
        fromContainer.startsWith("day-") &&
        toContainer === "sidebar"
      ) {
        // 從天數移動回 sidebar
        success = await moveFromDayToSidebar(itemToMove, fromContainer);
      } else if (fromContainer.startsWith("day-") && toContainer === "temp") {
        // 從天數移動到暫存
        success = await moveFromDayToTemp(itemToMove, fromContainer);
      } else if (
        fromContainer.startsWith("day-") &&
        toContainer.startsWith("day-")
      ) {
        // 從天數移動到天數
        success = await moveBetweenDays(itemToMove, fromContainer, toContainer);
      }

      if (success) {
        notify({ type: "success", message: "景點移動成功！" });
      }
    } catch (error) {
      console.error("移動失敗:", error);
      notify({ type: "error", message: "移動失敗，請稍後再試！" });
    }
  };

  // 獲取可用容器選項
  const getAvailableContainers = () => {
    const containers = [{ value: "temp", label: "暫存" }];

    daysList.forEach((dayId) => {
      const dayNumber = dayId.replace("day-", "");
      containers.push({
        value: dayId,
        label: `第 ${dayNumber} 天`,
      });
    });

    return containers;
  };

  // 在暫存內重新排序
  const reorderInTemp = async (activeId: string, overId: string) => {
    // 實現重新排序邏輯
    const newTempPlaces = [...tempPlaces];
    const activeIndex = newTempPlaces.findIndex(
      (item) => item.docId === activeId
    );
    const overIndex = newTempPlaces.findIndex((item) => item.docId === overId);

    if (activeIndex !== -1 && overIndex !== -1) {
      const [removed] = newTempPlaces.splice(activeIndex, 1);
      newTempPlaces.splice(overIndex, 0, removed);

      // 更新所有項目的順序
      const batch = writeBatch(db);
      newTempPlaces.forEach((item, index) => {
        const ref = doc(
          db,
          `users/${user!.uid}/plans/${planId}/tempPlaces`,
          item.docId
        );
        batch.update(ref, { order: index });
      });

      await batch.commit();
      setTempPlaces(
        newTempPlaces.map((item, index) => ({ ...item, order: index }))
      );
    }
  };

  // 在天數內重新排序
  const reorderInDay = async (
    activeId: string,
    overId: string,
    dayId: string
  ) => {
    const currentDayPlaces = [...dayPlaces[dayId]];
    const activeIndex = currentDayPlaces.findIndex(
      (item) => item.docId === activeId
    );
    const overIndex = currentDayPlaces.findIndex(
      (item) => item.docId === overId
    );

    if (activeIndex !== -1 && overIndex !== -1) {
      const [removed] = currentDayPlaces.splice(activeIndex, 1);
      currentDayPlaces.splice(overIndex, 0, removed);

      // 更新所有項目的順序
      const batch = writeBatch(db);
      currentDayPlaces.forEach((item, index) => {
        const ref = doc(
          db,
          `users/${user!.uid}/plans/${planId}/days/${dayId}/places`,
          item.docId
        );
        batch.update(ref, { order: index });
      });

      await batch.commit();

      setDayPlaces((prev) => ({
        ...prev,
        [dayId]: currentDayPlaces.map((item, index) => ({
          ...item,
          order: index,
        })),
      }));
    }
  };

  // 開啟編輯行程
  const handleEditPlan = () => {
    if (!planInfo) return;

    setEditPlanData({
      name: planInfo.name,
      startDate: planInfo.startDate,
      endDate: planInfo.endDate,
      note: planInfo.note,
    });
    openEditPlan();
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps) {
      setIsGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (selectedListPlaces) {
      setSidebarPlaces(selectedListPlaces);
    }
  }, [selectedListPlaces]);

  useEffect(() => {
    if (initPlanInfo) setPlanInfo(initPlanInfo);
    if (initTempPlaces) setTempPlaces(initTempPlaces);
    if (initDayList) setDaysList(initDayList);
    if (initPlacesData) setDayPlaces(initPlacesData);
  }, [initPlanInfo, initTempPlaces, initDayList, initPlacesData]);
  if (user === undefined) return null;

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=beta&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          setIsGoogleLoaded(true); // 確保 google 載入完成後再渲染地圖
        }}
      />
      <div className="h-[calc(100vh-160px)] w-[98vw] mt-5 shadow-lg shadow-foreground/50 relative flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-[800px] bg-gray-100 px-1">
          {user && isGoogleLoaded && <MapWithPlaceAutocomplete />}
        </div>

        {/* 主要內容區塊 */}
        <div className="flex flex-1 py-2 gap-2 justify-center">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Sidebar - 景點清單容器 */}
            <div className="w-[400px] bg-gray-200 p-4 h-full rounded-lg">
              <div className="mb-2">
                <Select
                  label="選擇清單:"
                  checkIconPosition="left"
                  value={selectedList}
                  onChange={handleSelectList}
                  data={lists}
                  placeholder="選擇一個收藏清單"
                  clearable
                  searchable
                  nothingFoundMessage="找不到清單"
                  //   isLoading={isFetchingLists}
                  className="mb-4"
                />
              </div>

              <Droppable id="sidebar-container">
                <div className="flex-1 p-2 pr-3 rounded-lg border border-gray-200 bg-white overflow-y-auto h-[calc(100%-80px)]">
                  {isLoadingListItems ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader size="md" />
                    </div>
                  ) : sidebarPlaces.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📋</div>
                        <p className="text-sm">
                          {selectedList ? "此清單尚無景點" : "請選擇收藏清單"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <SortableContext
                      items={sidebarPlaces.map((place) => place.docId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {sidebarPlaces.map((item) => (
                          <DraggableItem
                            key={item.docId}
                            placeData={item}
                            onDelete={handleDelete}
                            onUpdateNote={handleUpdateNote}
                            currentContainer="sidebar"
                            onMove={handleMove}
                            availableContainers={getAvailableContainers()}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  )}
                </div>
              </Droppable>
            </div>

            {/* Itinerary - 行程容器 */}
            <div className="w-[400px] bg-blue-50 h-full px-3 rounded-lg">
              {/* 行程標題區塊 */}
              {planInfo && (
                <div className="border rounded-xl p-4 mt-4 shadow-sm bg-white">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <span>{planInfo.name || "未命名行程"}</span>
                      <Button
                        size="compact-xs"
                        variant="outline"
                        color="blue"
                        className="hover:bg-blue-50 transition"
                        onClick={handleEditPlan}
                        disabled={isUpdatingPlan}
                      >
                        <IconEdit size={16} />
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">旅遊日期：</span>
                      {planInfo.startDate && planInfo.endDate
                        ? `${planInfo.startDate} ～ ${planInfo.endDate}`
                        : "日期未定"}
                    </div>

                    {planInfo.note && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">備註：</span>
                        {planInfo.note}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* 分頁標籤 */}
              <div className="flex border-b my-2  overflow-x-auto bg-white rounded-t-lg relative">
                <button
                  className={` px-2 pt-3 pb-1 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "temp"
                      ? "border-b-2 border-blue-700 text-gray-700 bg-blue-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("temp")}
                >
                  暫存 ({tempPlaces.length})
                </button>

                {daysList.map((dayId) => (
                  <div key={dayId} className="relative group flex-shrink-0">
                    <button
                      className={`px-2 pt-3 pb-1 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === dayId
                          ? "border-b-2 border-blue-500 text-gray-700 bg-blue-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab(dayId)}
                    >
                      Day-{dayId.replace("day-", "")} (
                      {dayPlaces[dayId]?.length || 0})
                    </button>

                    {/* 刪除天數按鈕 - 只在該天數頁面顯示 */}
                    {activeTab === dayId && daysList.length > 0 && (
                      <button
                        onClick={() => removeDay(dayId)}
                        disabled={isManagingDays}
                        className="absolute -top-0 -right-1 rounded-full "
                        title={`刪除第 ${dayId.replace("day-", "")} 天`}
                      >
                        <IconXboxXFilled
                          size={20}
                          className="text-red-400 flex-shrink-0 hover:text-red-600 rounded-full  transition-colors opacity-0 group-hover:opacity-100"
                        />
                      </button>
                    )}
                  </div>
                ))}

                {/* 新增天數按鈕 */}
                <button
                  onClick={addNewDay}
                  disabled={isManagingDays}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors flex items-center gap-1"
                  title="新增天數"
                >
                  <IconPlus size={16} />
                </button>
              </div>
              {/* 內容區塊 */}
              <div className="bg-white rounded-lg shadow-sm h-[calc(100%-200px)]">
                {/* 暫存景點頁面 */}
                {activeTab === "temp" && (
                  <Droppable id="temp-container">
                    <div className="p-4 h-full overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
                        暫存景點
                      </h3>

                      {tempPlaces.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📋</div>
                            <p className="text-sm">暫存區為空</p>
                            <p className="text-xs text-gray-300 mt-1">
                              從景點清單拖拽景點到此處暫存
                            </p>
                          </div>
                        </div>
                      ) : (
                        <SortableContext
                          items={tempPlaces.map((place) => place.docId)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {tempPlaces.map((item) => (
                              <DraggableItem
                                key={item.docId}
                                placeData={item}
                                onDelete={handleDelete}
                                onUpdateNote={handleUpdateNote}
                                currentContainer="temp"
                                onMove={handleMove}
                                availableContainers={getAvailableContainers()}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </div>
                  </Droppable>
                )}

                {/* 天數頁面 */}
                {activeTab !== "temp" && daysList.includes(activeTab) && (
                  <Droppable id={`${activeTab}-container`}>
                    <div className="p-4 h-full overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
                        第 {activeTab.replace("day-", "")} 天
                      </h3>

                      {(dayPlaces[activeTab]?.length || 0) === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📅</div>
                            <p className="text-sm">尚未安排行程</p>
                            <p className="text-xs text-gray-300 mt-1">
                              從暫存區或清單拖拽景點到此處
                            </p>
                          </div>
                        </div>
                      ) : (
                        <SortableContext
                          items={(dayPlaces[activeTab] || []).map(
                            (place) => place.docId
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {(dayPlaces[activeTab] || []).map((item, index) => (
                              <div key={item.docId} className="relative">
                                <div className="absolute left-0 top-0 bg-blue-100 text-blue-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                                  {index + 1}
                                </div>
                                <div className="ml-2">
                                  <DraggableItem
                                    placeData={item}
                                    onDelete={handleDelete}
                                    onUpdateNote={handleUpdateNote}
                                    currentContainer={activeTab}
                                    onMove={handleMove}
                                    availableContainers={getAvailableContainers()}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </div>
                  </Droppable>
                )}
              </div>
            </div>

            {/* 拖拽預覽 */}
            <DragOverlay>
              {activeItem && (
                <div className="relative h-auto p-3 rounded-lg border-2 border-blue-300 bg-white shadow-xl w-[360px] max-w-full opacity-90">
                  <div className="flex gap-3">
                    <div className="w-[80px] h-[60px] bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                      {activeItem.photoUrl ? (
                        <img
                          src={activeItem.photoUrl}
                          alt={activeItem.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        "無圖片"
                      )}
                    </div>

                    <div className="flex flex-col gap-y-1 flex-1 overflow-hidden">
                      <div className="font-medium text-sm truncate">
                        {activeItem.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {activeItem.address}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconNotes
                          size={12}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <div className="text-xs text-gray-500 truncate">
                          {activeItem.note || "尚無備註"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        {/* 編輯行程 */}
        <Modal
          opened={editPlanOpened}
          onClose={closeEditPlan}
          title="修改行程資訊"
          size="md"
          centered
        >
          <HandlePlan
            onClose={closeEditPlan}
            onSubmit={handleUpdatePlan}
            defaultData={editPlanData}
            mode="edit"
            isLoading={isUpdatingPlan}
          />
        </Modal>
      </div>
    </>
  );
}

// Droppable 組件 - 可放置區域
function Droppable({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} className="h-full">
      {children}
    </div>
  );
}

function DraggableItem({
  placeData,
  onDelete,
  onUpdateNote,
  currentContainer, // 當前容器
  onMove,
  availableContainers, // 可用的目標容器列表
}: PlaceItemWithActions & {
  currentContainer: string;
  onMove: (itemId: string, fromContainer: string, toContainer: string) => void;
  availableContainers: Array<{ value: string; label: string }>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: placeData.docId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(placeData.note || "");
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [noteModalOpened, setNoteModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  const handleSaveNote = () => {
    onUpdateNote(
      placeData.docId,
      noteValue.trim() || null,
      currentContainer,
      () => {
        setNoteModalOpened(false);
      }
    );
    setIsEditing(false);
  };

  // 刪除確認
  const handleConfirmDelete = () => {
    onDelete(placeData.docId, currentContainer, () => {
      setDeleteModalOpened(false);
    });
  };

  const handleOpenNoteModal = () => {
    setNoteValue(placeData.note || "");
    setNoteModalOpened(true);
  };

  const handleCloseNoteModal = () => {
    setNoteModalOpened(false);
    setNoteValue("");
  };

  const handleMove = (targetContainer: string) => {
    onMove(placeData.docId, currentContainer, targetContainer);
    setShowMoveMenu(false);
  };

  const moveOptions = availableContainers.filter(
    (container) => container.value !== currentContainer
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-3 p-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 content-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <IconGripVertical size={20} />
        </div>

        <div className="w-[80px] h-[60px] bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
          {placeData.photoUrl ? (
            <img
              src={placeData.photoUrl}
              alt={placeData.name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <span className="text-xs text-gray-400">無圖片</span>
          )}
        </div>

        {/* 景點資訊 */}
        <div className="flex flex-col gap-y-1 flex-1 overflow-hidden">
          <div className="font-medium text-sm truncate" title={placeData.name}>
            {placeData.name}
          </div>
          <div
            className="text-xs text-gray-600 truncate"
            title={placeData.address}
          >
            {placeData.address}
          </div>
          {/* 備註區域 */}
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={handleOpenNoteModal}
              className="text-gray-400 hover:text-blue-700 p-1 rounded transition-colors"
              title="編輯備註"
            >
              <IconNotes size={14} />
            </button>
            <div
              className="text-xs text-gray-500 flex-1 cursor-pointer hover:text-gray-700 hover:bg-gray-50 rounded px-1 py-0.5 min-w-0 break-words"
              onClick={handleOpenNoteModal}
              title={placeData.note || "點擊添加備註"}
            >
              <span className="block truncate">
                {placeData.note || "點擊添加備註"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-shrink-0 relative">
          {/* 移動按鈕 */}
          {moveOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className="text-gray-400 hover:text-green-600 transition-colors"
                title="移動景點"
              >
                <IconCalendarCode size={16} />
              </button>

              {/* 移動選單 */}
              {showMoveMenu && (
                <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[120px]">
                  <div className="py-1">
                    {moveOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleMove(option.value)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                      >
                        移至 {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setDeleteModalOpened(true)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="刪除景點"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      {showMoveMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMoveMenu(false)}
        />
      )}

      {/* 刪除確認*/}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="正在刪除景點"
        centered
      >
        <Text mb="sm">確定要移除「{placeData.name}」嗎？</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
            取消
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            確定刪除
          </Button>
        </Group>
      </Modal>

      {/* 編輯備註*/}
      <Modal
        opened={noteModalOpened}
        onClose={handleCloseNoteModal}
        title={`編輯景點備註 - ${placeData.name}`}
        centered
        size="sm"
      >
        <Textarea
          placeholder="輸入備註內容..."
          value={noteValue}
          onChange={(event) => setNoteValue(event.currentTarget.value)}
          autosize
          minRows={3}
          autoFocus
        />
        <Group mt="md" justify="flex-end">
          <Button variant="default" onClick={handleCloseNoteModal}>
            取消
          </Button>
          <Button onClick={handleSaveNote}>儲存</Button>
        </Group>
      </Modal>
    </div>
  );
}

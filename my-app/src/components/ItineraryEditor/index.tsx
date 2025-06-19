// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useUser } from "@/context/UserContext";
// import { useSearchParams } from "next/navigation";
// import { useDisclosure } from "@mantine/hooks";
// import { Modal, Button, Select, Loader } from "@mantine/core";
// import { IconEdit } from "@tabler/icons-react";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import {
//   doc,
//   setDoc,
//   updateDoc,
//   deleteDoc,
//   getDoc,
//   getDocs,
//   collection,
//   addDoc,
//   writeBatch,
//   Timestamp,
// } from "firebase/firestore";
// import { db } from "@/library/firebase";
// import { notify } from "@/utilities/notify";
// import HandlePlan from "@/components/HandlePlan";
// import DraggableItem from "@/components/DraggableItem";

// // 型別定義
// interface PlanInput {
//   name: string;
//   startDate: string | null;
//   endDate: string | null;
//   note: string | null;
// }

// interface PlanInfo extends PlanInput {
//   isPublic: boolean;
//   userName: string;
//   createdAt: Timestamp;
//   days?: any[];
// }

// interface EditPlan extends PlanInput {
//   id: string;
// }

// interface PlaceItem {
//   id: string;
//   title: string;
//   time?: string;
//   note?: string | null;
//   address?: string;
//   location?: { lat: number; lng: number };
//   [key: string]: any; // 允許額外的屬性
// }

// interface Day {
//   id: string;
//   title: string;
//   date?: string;
//   places: PlaceItem[];
// }

// type TabType = "info" | "day";

// // State 型別定義
// interface AppState {
//   days: Day[];
//   tempPlaces: PlaceItem[];
//   planInfo: PlanInfo | null;
//   activeTab: TabType;
//   activeDayIndex: number;
//   isUpdatingPlan: boolean;
// }

// // SortableItem Props 型別定義 (修正)
// interface SortableItemProps {
//   id: string;
//   title: string;
//   time?: string;
//   note?: string | null;
//   address?: string;
//   location?: { lat: number; lng: number };
//   index: number;
//   onTimeChange: (itemId: string, newTime: string) => void;
//   onDelete?: (itemId: string) => void;
//   onUpdateNote?: (itemId: string, newNote: string | null) => void;
//   [key: string]: any;
// }

// // 常數定義
// const INITIAL_STATE: AppState = {
//   days: [],
//   tempPlaces: [],
//   planInfo: null,
//   activeTab: "info",
//   activeDayIndex: 0,
//   isUpdatingPlan: false,
// };

// // 工具函數
// const formatDateString = (date: Date): string => {
//   return date.toISOString().split("T")[0];
// };

// const createNewDay = (
//   index: number,
//   startDate?: string | null
// ): Partial<Day> => {
//   let dateStr = "";
//   if (startDate) {
//     const start = new Date(startDate);
//     const currentDate = new Date(start);
//     currentDate.setDate(start.getDate() + (index - 1));
//     dateStr = formatDateString(currentDate);
//   }

//   return {
//     title: `第${index}天`,
//     date: dateStr,
//   };
// };

// // 自定義 Hook：Firebase 操作
// const useFirebaseOperations = (user: any, planId: string | null) => {
//   const addPlaceToTemp = useCallback(
//     async (place: {
//       name: string;
//       address: string;
//       location: { lat: number; lng: number };
//       note?: string;
//     }) => {
//       if (!user || !planId) return null;

//       const ref = collection(
//         db,
//         "users",
//         user.uid,
//         "plans",
//         planId,
//         "tempPlaces"
//       );
//       const docRef = await addDoc(ref, place);
//       return docRef.id;
//     },
//     [user, planId]
//   );

//   const fetchPlanData = useCallback(async () => {
//     if (!user || !planId) return null;

//     try {
//       // 取得行程資料
//       const planRef = doc(db, "users", user.uid, "plans", planId);
//       const planSnap = await getDoc(planRef);

//       let planInfo: PlanInfo | null = null;
//       if (planSnap.exists()) {
//         const data = planSnap.data();
//         planInfo = {
//           name: data.name ?? "",
//           startDate: data.startDate ?? null,
//           endDate: data.endDate ?? null,
//           note: data.note ?? null,
//           isPublic: data.isPublic ?? false,
//           userName: data.userName ?? "",
//           createdAt: data.createdAt ?? Timestamp.now(),
//           days: data.days ?? [],
//         };
//       }

//       // 取得暫存景點
//       const tempRef = collection(
//         db,
//         "users",
//         user.uid,
//         "plans",
//         planId,
//         "tempPlaces"
//       );
//       const tempSnap = await getDocs(tempRef);
//       const tempPlaces: PlaceItem[] = tempSnap.docs.map((doc) => ({
//         id: doc.id,
//         title: doc.data().title || "",
//         time: doc.data().time || "",
//         note: doc.data().note || null,
//         address: doc.data().address || "",
//         location: doc.data().location || { lat: 0, lng: 0 },
//         ...doc.data(),
//       }));

//       return { planInfo, tempPlaces };
//     } catch (error) {
//       console.error("獲取行程資料失敗：", error);
//       notify({ type: "error", message: "獲取行程資料失敗" });
//       return null;
//     }
//   }, [user, planId]);

//   const getDaysWithPlaces = useCallback(async (): Promise<Day[]> => {
//     if (!user || !planId) return [];

//     try {
//       const daysRef = collection(
//         db,
//         "users",
//         user.uid,
//         "plans",
//         planId,
//         "days"
//       );
//       const daysSnap = await getDocs(daysRef);

//       const daysData: Day[] = await Promise.all(
//         daysSnap.docs.map(async (dayDoc): Promise<Day> => {
//           const dayId = dayDoc.id;
//           const dayData = dayDoc.data();

//           const placesRef = collection(
//             db,
//             "users",
//             user.uid,
//             "plans",
//             planId,
//             "days",
//             dayId,
//             "places"
//           );
//           const placesSnap = await getDocs(placesRef);
//           const places: PlaceItem[] = placesSnap.docs.map((placeDoc) => {
//             const data = placeDoc.data();
//             return {
//               id: placeDoc.id,
//               title: data.title || "",
//               time: data.time || "",
//               note: data.note || null,
//               address: data.address || "",
//               location: data.location || { lat: 0, lng: 0 },
//               ...data,
//             };
//           });

//           return {
//             id: dayId,
//             title: dayData.title || "未命名天數",
//             date: dayData.date || "",
//             places,
//           };
//         })
//       );

//       return daysData;
//     } catch (error) {
//       console.error("獲取天數資料失敗：", error);
//       notify({ type: "error", message: "獲取天數資料失敗" });
//       return [];
//     }
//   }, [user, planId]);

//   return {
//     addPlaceToTemp,
//     fetchPlanData,
//     getDaysWithPlaces,
//   };
// };

// // 主組件
// export default function ItineraryEditor() {
//   const user = useUser();
//   const searchParams = useSearchParams();
//   const planId = searchParams.get("id");
//   const sensors = useSensors(useSensor(PointerSensor));

//   // State 管理
//   const [state, setState] = useState<AppState>(INITIAL_STATE);
//   const [editPlanOpened, { open: openEditPlan, close: closeEditPlan }] =
//     useDisclosure(false);
//   const [editPlanData, setEditPlanData] = useState<PlanInput | undefined>(
//     undefined
//   );
//   const [editPlanId, setEditPlanId] = useState<string | null>(null);

//   // 自定義 Hook
//   const { fetchPlanData, getDaysWithPlaces } = useFirebaseOperations(
//     user,
//     planId
//   );

//   // Memoized values
//   const currentDay = useMemo(() => {
//     return state.days[state.activeDayIndex] || null;
//   }, [state.days, state.activeDayIndex]);

//   const sortableItems = useMemo(() => {
//     return currentDay?.places.map((place) => place.id) || [];
//   }, [currentDay?.places]);

//   // 事件處理函數
//   const handleDragEnd = useCallback(
//     (event: any) => {
//       const { active, over } = event;
//       if (!over || active.id === over.id || !currentDay) return;

//       const oldIndex = currentDay.places.findIndex(
//         (item) => item.id === active.id
//       );
//       const newIndex = currentDay.places.findIndex(
//         (item) => item.id === over.id
//       );

//       if (oldIndex === -1 || newIndex === -1) return;

//       setState((prev) => {
//         const newDays = [...prev.days];
//         newDays[prev.activeDayIndex].places = arrayMove(
//           newDays[prev.activeDayIndex].places,
//           oldIndex,
//           newIndex
//         );
//         return { ...prev, days: newDays };
//       });
//     },
//     [currentDay]
//   );

//   const handleAddDay = useCallback(async () => {
//     const newIndex = state.days.length + 1;
//     const newDay = createNewDay(newIndex, state.planInfo?.startDate);
//     const newDayId = `day-${newIndex}`;

//     if (user && planId) {
//       try {
//         const dayDocRef = doc(
//           db,
//           "users",
//           user.uid,
//           "plans",
//           planId,
//           "days",
//           newDayId
//         );
//         await setDoc(dayDocRef, newDay);
//       } catch (error) {
//         console.error("新增天數失敗：", error);
//         notify({ type: "error", message: "新增天數失敗" });
//         return;
//       }
//     }

//     const newDayComplete: Day = {
//       id: newDayId,
//       title: newDay.title!,
//       date: newDay.date!,
//       places: [],
//     };

//     setState((prev) => ({
//       ...prev,
//       days: [...prev.days, newDayComplete],
//       activeTab: "day",
//       activeDayIndex: prev.days.length,
//     }));
//   }, [state.days, state.planInfo?.startDate, user, planId]);

//   const adjustDaysDates = useCallback(
//     async (newStartDate: Date) => {
//       const updatedDays = state.days.map((day, index) => {
//         const adjustedDate = new Date(newStartDate);
//         adjustedDate.setDate(newStartDate.getDate() + index);
//         return {
//           ...day,
//           date: formatDateString(adjustedDate),
//         };
//       });

//       setState((prev) => ({ ...prev, days: updatedDays }));

//       if (user && planId) {
//         try {
//           const batch = writeBatch(db);
//           updatedDays.forEach((day) => {
//             const dayRef = doc(
//               db,
//               "users",
//               user.uid,
//               "plans",
//               planId,
//               "days",
//               day.id
//             );
//             batch.update(dayRef, { date: day.date });
//           });
//           await batch.commit();
//         } catch (error) {
//           console.error("更新天數日期失敗：", error);
//           notify({ type: "error", message: "更新天數日期失敗" });
//         }
//       }
//     },
//     [state.days, user, planId]
//   );

//   const handleEditPlan = useCallback(
//     (plan: EditPlan) => {
//       setEditPlanId(plan.id);
//       setEditPlanData({
//         name: plan.name,
//         startDate: plan.startDate,
//         endDate: plan.endDate,
//         note: plan.note,
//       });
//       openEditPlan();
//     },
//     [openEditPlan]
//   );

//   const handleUpdatePlan = useCallback(
//     async (planInput: PlanInput) => {
//       if (!user || !planId) {
//         notify({ type: "error", message: "無法取得使用者或行程" });
//         return;
//       }

//       setState((prev) => ({ ...prev, isUpdatingPlan: true }));

//       try {
//         const planRef = doc(db, `users/${user.uid}/plans/${planId}`);
//         await updateDoc(planRef, {
//           name: planInput.name,
//           startDate: planInput.startDate || null,
//           endDate: planInput.endDate || null,
//           note: planInput.note?.trim() || null,
//         });

//         const shouldAdjustDays =
//           planInput.startDate &&
//           state.planInfo?.startDate &&
//           planInput.startDate !== state.planInfo.startDate;

//         setState((prev) => ({
//           ...prev,
//           planInfo: prev.planInfo
//             ? {
//                 ...prev.planInfo,
//                 name: planInput.name,
//                 startDate: planInput.startDate || null,
//                 endDate: planInput.endDate || null,
//                 note: planInput.note?.trim() || null,
//               }
//             : null,
//         }));

//         if (shouldAdjustDays) {
//           await adjustDaysDates(new Date(planInput.startDate!));
//         }

//         notify({ type: "success", message: "行程已更新！" });
//         closeEditPlan();
//       } catch (error) {
//         console.error("更新行程失敗", error);
//         notify({ type: "error", message: "更新行程失敗，請稍後再試！" });
//       } finally {
//         setState((prev) => ({ ...prev, isUpdatingPlan: false }));
//       }
//     },
//     [user, planId, state.planInfo, adjustDaysDates, closeEditPlan]
//   );

//   const handleTimeChange = useCallback(
//     (itemId: string, newTime: string) => {
//       if (!currentDay) return;

//       setState((prev) => {
//         const newDays = [...prev.days];
//         const dayIndex = prev.activeDayIndex;
//         const placeIndex = newDays[dayIndex].places.findIndex(
//           (place) => place.id === itemId
//         );

//         if (placeIndex === -1) return prev;

//         newDays[dayIndex].places[placeIndex] = {
//           ...newDays[dayIndex].places[placeIndex],
//           time: newTime,
//         };

//         return { ...prev, days: newDays };
//       });
//     },
//     [currentDay]
//   );

//   const deletePlace = useCallback(
//     async (placeId: string) => {
//       if (!user || !planId) return;

//       // 暫存區
//       if (state.activeTab === "info") {
//         setState((prev) => ({
//           ...prev,
//           tempPlaces: prev.tempPlaces.filter((p) => p.id !== placeId),
//         }));
//         notify({ type: "success", message: "已從暫存清單刪除" });
//         return;
//       }

//       // 天數區
//       if (!currentDay) return;

//       try {
//         const placeRef = doc(
//           db,
//           "users",
//           user.uid,
//           "plans",
//           planId,
//           "days",
//           currentDay.id,
//           "places",
//           placeId
//         );
//         await deleteDoc(placeRef);

//         setState((prev) => {
//           const newDays = [...prev.days];
//           newDays[prev.activeDayIndex].places = newDays[
//             prev.activeDayIndex
//           ].places.filter((place) => place.id !== placeId);
//           return { ...prev, days: newDays };
//         });

//         notify({ type: "success", message: "景點已刪除" });
//       } catch (error) {
//         console.error("刪除景點失敗：", error);
//         notify({ type: "error", message: "刪除景點失敗，請稍後再試！" });
//       }
//     },
//     [user, planId, state.activeTab, currentDay]
//   );

//   const handleUpdateNote = useCallback(
//     async (placeId: string, newNote: string | null) => {
//       if (!user || !planId) return;

//       // 暫存區
//       if (state.activeTab === "info") {
//         setState((prev) => ({
//           ...prev,
//           tempPlaces: prev.tempPlaces.map((place) =>
//             place.id === placeId ? { ...place, note: newNote } : place
//           ),
//         }));

//         try {
//           const noteRef = doc(
//             db,
//             "users",
//             user.uid,
//             "plans",
//             planId,
//             "tempPlaces",
//             placeId
//           );
//           await updateDoc(noteRef, { note: newNote });
//           notify({ type: "success", message: "景點備註已更新" });
//         } catch (error) {
//           notify({ type: "error", message: "更新備註失敗" });
//           console.error("更新備註錯誤", error);
//         }
//         return;
//       }

//       // 天數區
//       if (!currentDay) return;

//       try {
//         const placeRef = doc(
//           db,
//           "users",
//           user.uid,
//           "plans",
//           planId,
//           "days",
//           currentDay.id,
//           "places",
//           placeId
//         );
//         await updateDoc(placeRef, { note: newNote });

//         setState((prev) => {
//           const newDays = [...prev.days];
//           newDays[prev.activeDayIndex].places = newDays[
//             prev.activeDayIndex
//           ].places.map((place) =>
//             place.id === placeId ? { ...place, note: newNote } : place
//           );
//           return { ...prev, days: newDays };
//         });

//         notify({ type: "success", message: "備註已更新" });
//       } catch (error) {
//         console.error("更新備註失敗：", error);
//         notify({ type: "error", message: "備註更新失敗，請稍後再試！" });
//       }
//     },
//     [user, planId, state.activeTab, currentDay]
//   );

//   // Effects
//   useEffect(() => {
//     if (!user || !planId) return;

//     const fetchAllData = async () => {
//       const [planData, daysData] = await Promise.all([
//         fetchPlanData(),
//         getDaysWithPlaces(),
//       ]);

//       if (planData) {
//         setState((prev) => ({
//           ...prev,
//           planInfo: planData.planInfo,
//           tempPlaces: planData.tempPlaces,
//           days: daysData,
//         }));
//       }
//     };

//     fetchAllData();
//   }, [user, planId, fetchPlanData, getDaysWithPlaces]);

//   useEffect(() => {
//     if (state.activeTab === "day" && user && planId) {
//       getDaysWithPlaces().then((updatedDays) => {
//         setState((prev) => ({ ...prev, days: updatedDays }));
//       });
//     }
//   }, [state.activeTab, user, planId, getDaysWithPlaces]);

//   // 渲染邏輯組件
//   const renderPlanInfo = () => (
//     <div className="border rounded-xl p-4 shadow-sm bg-white">
//       {state.planInfo ? (
//         <div className="space-y-2">
//           <div className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
//             <span>{state.planInfo.name || "未命名行程"}</span>
//             <Button
//               size="compact-xs"
//               variant="outline"
//               color="#2C3E50"
//               className="hover:bg-red-600 transition"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleEditPlan({ id: planId!, ...state.planInfo! });
//               }}
//             >
//               修改行程
//               <IconEdit size={20} />
//             </Button>
//           </div>

//           <div className="text-gray-600">
//             <span className="font-medium">旅遊日期：</span>
//             {state.planInfo.startDate && state.planInfo.endDate
//               ? `${state.planInfo.startDate} ～ ${state.planInfo.endDate}`
//               : "日期未定"}
//           </div>

//           <div className="text-gray-600">
//             <span className="font-medium">備註：</span>
//             {state.planInfo.note ? (
//               state.planInfo.note
//             ) : (
//               <span className="text-gray-400">--尚無備註--</span>
//             )}
//           </div>
//         </div>
//       ) : (
//         <p className="text-gray-500">載入中或無行程資訊...</p>
//       )}

//       <h3 className="mt-6 text-lg font-semibold text-gray-800">暫存景點</h3>
//       <div className="flex flex-col items-center gap-4 justify-center">
//         {state.tempPlaces.length > 0 ? (
//           state.tempPlaces.map((place) => (
//             <DraggableItem
//               key={item.docId}
//               placeData={item}
//               onDelete={handleDelete}
//               onUpdateNote={handleUpdateNote}
//             />
//           ))
//         ) : (
//           <div className="mt-10 text-center text-gray-500">
//             尚無安排任何地點
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderDayContent = () => {
//     if (!currentDay) {
//       return <p>尚無天數資料</p>;
//     }

//     return (
//       <>
//         <h2 className="text-lg font-bold mb-2 text-center">
//           {currentDay.title} · {currentDay.date || ""}
//         </h2>

//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCenter}
//           onDragEnd={handleDragEnd}
//         >
//           <SortableContext
//             items={sortableItems}
//             strategy={verticalListSortingStrategy}
//           >
//             <div className="space-y-2">
//               {currentDay.places.length > 0 ? (
//                 currentDay.places.map((place, index) => (
//                   <div key={place.id}>
//                     <DraggableItem
//                       key={item.docId}
//                       placeData={item}
//                       onDelete={handleDelete}
//                       onUpdateNote={handleUpdateNote}
//                     />
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center text-gray-500 py-4">
//                   尚無景點，請新增
//                 </div>
//               )}
//             </div>
//           </SortableContext>
//         </DndContext>
//       </>
//     );
//   };

//   return (
//     <div className="basis-1/4 flex flex-col h-full">
//       <Modal
//         opened={editPlanOpened}
//         onClose={closeEditPlan}
//         title="修改行程資訊"
//         size="xs"
//         centered
//       >
//         <HandlePlan
//           onClose={closeEditPlan}
//           onSubmit={handleUpdatePlan}
//           isLoading={state.isUpdatingPlan}
//           defaultData={
//             editPlanData
//               ? { ...editPlanData, note: editPlanData.note ?? "" }
//               : undefined
//           }
//           mode="edit"
//         />
//       </Modal>

//       {/* Tab Buttons */}
//       <div className="border-b px-4 py-2 overflow-x-auto">
//         <div className="flex items-center gap-1 flex-nowrap w-max">
//           <button
//             onClick={() => setState((prev) => ({ ...prev, activeTab: "info" }))}
//             className={`px-3 py-1 text-sm rounded ${
//               state.activeTab === "info"
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-100 hover:bg-gray-200"
//             }`}
//           >
//             行程總覽
//           </button>

//           {state.days.map((day, index) => (
//             <button
//               key={day.id}
//               onClick={() => {
//                 setState((prev) => ({
//                   ...prev,
//                   activeTab: "day",
//                   activeDayIndex: index,
//                 }));
//               }}
//               className={`px-3 py-1 text-sm rounded ${
//                 state.activeTab === "day" && state.activeDayIndex === index
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-100 hover:bg-gray-200"
//               }`}
//             >
//               {day.title}
//             </button>
//           ))}
//           <button
//             onClick={handleAddDay}
//             className="ml-auto text-blue-500 hover:text-blue-700 font-bold text-xl"
//             aria-label="新增天數"
//           >
//             ＋
//           </button>
//         </div>
//       </div>

//       {/* 內容區 */}
//       <div className="flex-1 overflow-y-auto p-4">
//         {state.activeTab === "info" ? renderPlanInfo() : renderDayContent()}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { useAuthCheck } from "@/hooks/useAuthCheck";
// import { useSearchParams } from "next/navigation";
// import { db } from "@/library/firebase";
// import { notify } from "@/utilities/notify";
// import {
//   IconSettings,
//   IconNotes,
//   IconEdit,
//   IconGripVertical,
//   IconCheck,
//   IconX,
//   IconTrash,
// } from "@tabler/icons-react";
// import { useDisclosure } from "@mantine/hooks";
// import {
//   getDocs,
//   getDoc,
//   collection,
//   setDoc,
//   query,
//   doc,
//   deleteDoc,
//   updateDoc,
//   orderBy,
//   Timestamp,
//   serverTimestamp,
//   writeBatch,
//   FieldValue,
// } from "firebase/firestore";
// import {
//   ActionIcon,
//   Button,
//   Group,
//   Select,
//   Loader,
//   Flex,
//   Modal,
// } from "@mantine/core";
// import {
//   DndContext,
//   DragEndEvent,
//   DragStartEvent,
//   DragOverEvent,
//   DragOverlay,
//   useSensor,
//   useSensors,
//   PointerSensor,
//   closestCorners,
//   useDroppable,
// } from "@dnd-kit/core";
// import {
//   useSortable,
//   SortableContext,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// // import DraggableItem from "@/components/DraggableItem";
// import HandlePlan from "@/components/HandlePlan";

// // 定義項目的數據結構
// interface Item {
//   id: string;
//   title: string;
//   description: string;
//   type: "attraction" | "restaurant" | "hotel" | "activity";
//   duration?: number;
//   location?: string;
// }

// // 定義容器的數據結構
// interface Container {
//   id: string;
//   title: string;
//   items: Item[];
//   type: "sidebar" | "itinerary";
// }

// // 可拖拽項目組件
// function DraggableItem({
//   item,
//   onEdit,
//   onDelete,
// }: {
//   item: Item;
//   onEdit: (item: Item) => void;
//   onDelete: (id: string) => void;
// }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({
//     id: item.id,
//   });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//   };

//   const typeColors = {
//     attraction: "bg-blue-100 border-blue-300",
//     restaurant: "bg-orange-100 border-orange-300",
//     hotel: "bg-purple-100 border-purple-300",
//     activity: "bg-green-100 border-green-300",
//   };

//   const typeEmojis = {
//     attraction: "🏛️",
//     restaurant: "🍽️",
//     hotel: "🏨",
//     activity: "🎯",
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className={`p-3 mb-2 rounded-lg border-2 cursor-grab active:cursor-grabbing group
//         ${typeColors[item.type]} hover:shadow-md transition-all relative`}
//     >
//       {/* 拖拽區域 */}
//       <div {...attributes} {...listeners} className="flex items-start gap-2">
//         <span className="text-lg">{typeEmojis[item.type]}</span>
//         <div className="flex-1">
//           <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
//           <p className="text-xs text-gray-600 mt-1">{item.description}</p>
//           {item.location && (
//             <p className="text-xs text-gray-500 mt-1">📍 {item.location}</p>
//           )}
//           {item.duration && (
//             <p className="text-xs text-gray-500 mt-1">
//               ⏱️ {item.duration} 分鐘
//             </p>
//           )}
//         </div>
//       </div>

//       {/* 操作按鈕 */}
//       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onEdit(item);
//           }}
//           className="p-1 bg-white rounded shadow-md hover:bg-gray-50 cursor-pointer"
//           title="編輯"
//         >
//           <span className="text-xs">✏️</span>
//         </button>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             if (confirm("確定要刪除這個項目嗎？")) {
//               onDelete(item.id);
//             }
//           }}
//           className="p-1 bg-white rounded shadow-md hover:bg-gray-50 cursor-pointer"
//           title="刪除"
//         >
//           <span className="text-xs">🗑️</span>
//         </button>
//       </div>
//     </div>
//   );
// }

// // 可放置的容器組件
// function DroppableContainer({
//   container,
//   children,
//   onAddItem,
// }: {
//   container: Container;
//   children: React.ReactNode;
//   onAddItem?: () => void;
// }) {
//   const { setNodeRef, isOver } = useDroppable({
//     id: container.id,
//   });

//   return (
//     <div
//       className={`${
//         container.type === "sidebar" ? "w-80" : "flex-1"
//       } min-h-[500px]`}
//     >
//       <div
//         ref={setNodeRef}
//         className={`bg-gray-50 rounded-lg p-4 h-full border-2 border-dashed transition-colors
//           ${isOver ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
//       >
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-bold text-gray-800">{container.title}</h3>
//           <div className="flex items-center gap-2">
//             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
//               {container.items.length} 項目
//             </span>
//             {container.type === "sidebar" && onAddItem && (
//               <button
//                 onClick={onAddItem}
//                 className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//                 title="新增項目"
//               >
//                 <span className="text-sm">➕</span>
//               </button>
//             )}
//           </div>
//         </div>

//         <SortableContext
//           items={container.items.map((item) => item.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <div className="space-y-2 flex-1 min-h-[400px]">
//             {children}

//             {/* 空列表時的提示區域 */}
//             {container.items.length === 0 && (
//               <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg py-12">
//                 <div className="text-center">
//                   <div className="text-4xl mb-2">
//                     {container.type === "sidebar" ? "📋" : "📅"}
//                   </div>
//                   <p className="text-sm">
//                     {container.type === "sidebar"
//                       ? "點擊 + 新增項目"
//                       : "將項目拖拽到這裡"}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </SortableContext>
//       </div>
//     </div>
//   );
// }

// export default function ItineraryDragDrop() {
//   const [isMounted, setIsMounted] = useState(false);
//   const [activeTab, setActiveTab] = useState("temp");
//   const [dayCount, setDayCount] = useState(3);
//   const [editingItem, setEditingItem] = useState<Item | null>(null);
//   const [isAddingItem, setIsAddingItem] = useState(false);
//   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

//   // 初始化數據
//   const [containers, setContainers] = useState<Container[]>([
//     {
//       id: "sidebar",
//       title: "景點清單",
//       type: "sidebar",
//       items: [
//         {
//           id: "1",
//           title: "台北101",
//           description: "台北地標摩天大樓",
//           type: "attraction",
//           duration: 120,
//           location: "信義區",
//         },
//         {
//           id: "2",
//           title: "鼎泰豐",
//           description: "知名小籠包餐廳",
//           type: "restaurant",
//           duration: 90,
//           location: "信義區",
//         },
//         {
//           id: "3",
//           title: "故宮博物院",
//           description: "中華文物典藏",
//           type: "attraction",
//           duration: 180,
//           location: "士林區",
//         },
//       ],
//     },
//     {
//       id: "temp",
//       title: "暫存區",
//       type: "itinerary",
//       items: [],
//     },
//     ...Array.from({ length: dayCount }, (_, i) => ({
//       id: `day-${i + 1}`,
//       title: `第 ${i + 1} 天`,
//       type: "itinerary" as const,
//       items: [] as Item[],
//     })),
//   ]);

//   const [activeItem, setActiveItem] = useState<Item | null>(null);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     })
//   );

//   useEffect(() => {
//     setIsMounted(true);
//     // 這裡可以加載資料庫資料
//     // loadItinerariesFromDB();
//   }, []);

//   // 當天數改變時更新容器
//   useEffect(() => {
//     setContainers((prev) => {
//       const sidebar = prev.find((c) => c.id === "sidebar");
//       const temp = prev.find((c) => c.id === "temp");
//       const existingDays = prev.filter((c) => c.id.startsWith("day-"));

//       const dayContainers = Array.from({ length: dayCount }, (_, i) => {
//         const dayId = `day-${i + 1}`;
//         const existingDay = existingDays.find((d) => d.id === dayId);

//         return (
//           existingDay || {
//             id: dayId,
//             title: `第 ${i + 1} 天`,
//             type: "itinerary" as const,
//             items: [] as Item[],
//           }
//         );
//       });

//       return [sidebar!, temp!, ...dayContainers];
//     });
//   }, [dayCount]);

//   // API 函數們 - 在實際專案中這些會呼叫後端 API
//   const saveItinerariesToDB = async (data: Container[]) => {
//     try {
//       // 模擬 API 呼叫
//       console.log("儲存行程到資料庫:", data);
//       // const response = await fetch('/api/itineraries', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify(data)
//       // });
//       // return response.json();
//       setHasUnsavedChanges(false);
//       alert("行程已儲存！");
//     } catch (error) {
//       console.error("儲存失敗:", error);
//       alert("儲存失敗，請重試");
//     }
//   };

//   // CRUD 操作函數
//   const handleEditItem = (item: Item) => {
//     setEditingItem(item);
//   };

//   const handleDeleteItem = (itemId: string) => {
//     setContainers((prev) =>
//       prev.map((container) => ({
//         ...container,
//         items: container.items.filter((item) => item.id !== itemId),
//       }))
//     );
//     setHasUnsavedChanges(true);
//   };

//   const handleSaveItem = (item: Item) => {
//     if (editingItem) {
//       // 編輯現有項目
//       setContainers((prev) =>
//         prev.map((container) => ({
//           ...container,
//           items: container.items.map((existingItem) =>
//             existingItem.id === item.id ? item : existingItem
//           ),
//         }))
//       );
//     } else {
//       // 新增項目到側邊欄
//       setContainers((prev) =>
//         prev.map((container) =>
//           container.id === "sidebar"
//             ? { ...container, items: [...container.items, item] }
//             : container
//         )
//       );
//     }
//     setEditingItem(null);
//     setIsAddingItem(false);
//     setHasUnsavedChanges(true);
//   };

//   const handleAddNewItem = () => {
//     setIsAddingItem(true);
//     setEditingItem(null);
//   };

//   const handleCancelEdit = () => {
//     setEditingItem(null);
//     setIsAddingItem(false);
//   };

//   if (!isMounted) {
//     return (
//       <div className="p-6 max-w-7xl mx-auto">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             行程規劃系統
//           </h1>
//           <p className="text-gray-600">載入中...</p>
//         </div>
//       </div>
//     );
//   }

//   // 拖拽處理函數（保持原有邏輯）
//   const findContainer = (id: string) => {
//     for (const container of containers) {
//       if (container.items.some((item) => item.id === id)) {
//         return container.id;
//       }
//     }
//     return null;
//   };

//   const handleDragStart = (event: DragStartEvent) => {
//     const { active } = event;
//     const activeContainer = findContainer(active.id as string);
//     if (activeContainer) {
//       const container = containers.find((c) => c.id === activeContainer);
//       const item = container?.items.find((item) => item.id === active.id);
//       setActiveItem(item || null);
//     }
//   };

//   const handleDragOver = (event: DragOverEvent) => {
//     const { active, over } = event;
//     if (!over) return;

//     const activeId = active.id as string;
//     const overId = over.id as string;

//     const activeContainer = findContainer(activeId);
//     const overContainer = findContainer(overId) || overId;

//     if (
//       !activeContainer ||
//       !overContainer ||
//       activeContainer === overContainer
//     ) {
//       return;
//     }

//     setContainers((prev) => {
//       const activeContainerIndex = prev.findIndex(
//         (c) => c.id === activeContainer
//       );
//       const overContainerIndex = prev.findIndex((c) => c.id === overContainer);

//       if (activeContainerIndex === -1 || overContainerIndex === -1) return prev;

//       const activeItems = [...prev[activeContainerIndex].items];
//       const overItems = [...prev[overContainerIndex].items];

//       const activeItemIndex = activeItems.findIndex(
//         (item) => item.id === activeId
//       );
//       const activeItem = activeItems[activeItemIndex];

//       activeItems.splice(activeItemIndex, 1);
//       overItems.push(activeItem);

//       const newContainers = [...prev];
//       newContainers[activeContainerIndex] = {
//         ...prev[activeContainerIndex],
//         items: activeItems,
//       };
//       newContainers[overContainerIndex] = {
//         ...prev[overContainerIndex],
//         items: overItems,
//       };

//       return newContainers;
//     });
//     setHasUnsavedChanges(true);
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     setActiveItem(null);

//     if (!over) return;

//     const activeId = active.id as string;
//     const overId = over.id as string;

//     const activeContainer = findContainer(activeId);
//     const overContainer = findContainer(overId) || overId;

//     if (!activeContainer) return;

//     if (activeContainer === overContainer) {
//       setContainers((prev) => {
//         const containerIndex = prev.findIndex((c) => c.id === activeContainer);
//         const items = [...prev[containerIndex].items];

//         const activeIndex = items.findIndex((item) => item.id === activeId);
//         const overIndex = items.findIndex((item) => item.id === overId);

//         if (activeIndex !== overIndex) {
//           const [removed] = items.splice(activeIndex, 1);
//           items.splice(overIndex, 0, removed);
//         }

//         const newContainers = [...prev];
//         newContainers[containerIndex] = {
//           ...prev[containerIndex],
//           items,
//         };

//         return newContainers;
//       });
//       setHasUnsavedChanges(true);
//     }
//   };

//   const tabs = [
//     { id: "temp", label: "行程總覽" },
//     ...Array.from({ length: dayCount }, (_, i) => ({
//       id: `day-${i + 1}`,
//       label: `第 ${i + 1} 天`,
//     })),
//   ];

//   const currentItineraryContainer = containers.find((c) => c.id === activeTab);
//   const sidebarContainer = containers.find((c) => c.id === "sidebar");

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">
//               行程規劃系統
//             </h1>
//             <p className="text-gray-600">
//               從左側景點清單拖拽項目到右側行程規劃區域
//             </p>
//           </div>

//           {/* 儲存按鈕 */}
//           <button
//             onClick={() => saveItinerariesToDB(containers)}
//             className={`px-4 py-2 rounded-md flex items-center gap-2 ${
//               hasUnsavedChanges
//                 ? "bg-blue-500 text-white hover:bg-blue-600"
//                 : "bg-gray-300 text-gray-500 cursor-not-allowed"
//             }`}
//             disabled={!hasUnsavedChanges}
//           >
//             💾 {hasUnsavedChanges ? "儲存變更" : "已儲存"}
//           </button>
//         </div>

//         {/* 天數控制 */}
//         <div className="flex items-center gap-4 mb-4">
//           <label className="text-sm font-medium text-gray-700">
//             行程天數：
//           </label>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setDayCount(Math.max(1, dayCount - 1))}
//               className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//             >
//               -
//             </button>
//             <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
//               {dayCount} 天
//             </span>
//             <button
//               onClick={() => setDayCount(Math.min(14, dayCount + 1))}
//               className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
//             >
//               +
//             </button>
//           </div>
//         </div>
//       </div>

//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCorners}
//         onDragStart={handleDragStart}
//         onDragOver={handleDragOver}
//         onDragEnd={handleDragEnd}
//       >
//         <div className="flex gap-6">
//           {/* Sidebar 區域 */}
//           {sidebarContainer && (
//             <DroppableContainer
//               container={sidebarContainer}
//               onAddItem={handleAddNewItem}
//             >
//               {sidebarContainer.items.map((item) => (
//                 <DraggableItem
//                   key={item.id}
//                   item={item}
//                   onEdit={handleEditItem}
//                   onDelete={handleDeleteItem}
//                 />
//               ))}
//             </DroppableContainer>
//           )}

//           {/* Itinerary 區域 */}
//           <div className="flex-1">
//             {/* 分頁標籤 */}
//             <div className="mb-4">
//               <div className="border-b border-gray-200">
//                 <nav className="-mb-px flex space-x-8">
//                   {tabs.map((tab) => (
//                     <button
//                       key={tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                       className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
//                         activeTab === tab.id
//                           ? "border-blue-500 text-blue-600"
//                           : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                       }`}
//                     >
//                       {tab.label}
//                       {containers.find((c) => c.id === tab.id)?.items.length! >
//                         0 && (
//                         <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//                           {
//                             containers.find((c) => c.id === tab.id)?.items
//                               .length
//                           }
//                         </span>
//                       )}
//                     </button>
//                   ))}
//                 </nav>
//               </div>
//             </div>

//             {/* 預留空白區域 */}
//             <div
//               className={`mb-4 ${
//                 activeTab === "temp" ? "h-32" : "h-24"
//               } bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center`}
//             >
//               <div className="text-center text-gray-500">
//                 <div className="text-2xl mb-2">
//                   {activeTab === "temp" ? "📊" : "📅"}
//                 </div>
//                 <p className="text-sm">
//                   {activeTab === "temp"
//                     ? "行程總覽統計區域"
//                     : `第${activeTab.replace("day-", "")}天行程資訊`}
//                 </p>
//               </div>
//             </div>

//             {/* 當前分頁內容 */}
//             {currentItineraryContainer && (
//               <DroppableContainer container={currentItineraryContainer}>
//                 {currentItineraryContainer.items.map((item) => (
//                   <DraggableItem
//                     key={item.id}
//                     item={item}
//                     onEdit={handleEditItem}
//                     onDelete={handleDeleteItem}
//                   />
//                 ))}
//               </DroppableContainer>
//             )}
//           </div>
//         </div>

//         <DragOverlay>
//           {activeItem ? (
//             <div className="p-3 mb-2 rounded-lg border-2 bg-white shadow-lg">
//               <div className="flex items-start gap-2">
//                 <span className="text-lg">
//                   {activeItem.type === "attraction" && "🏛️"}
//                   {activeItem.type === "restaurant" && "🍽️"}
//                   {activeItem.type === "hotel" && "🏨"}
//                   {activeItem.type === "activity" && "🎯"}
//                 </span>
//                 <div className="flex-1">
//                   <h4 className="font-semibold text-gray-800 text-sm">
//                     {activeItem.title}
//                   </h4>
//                   <p className="text-xs text-gray-600 mt-1">
//                     {activeItem.description}
//                   </p>
//                   {activeItem.location && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       📍 {activeItem.location}
//                     </p>
//                   )}
//                   {activeItem.duration && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       ⏱️ {activeItem.duration} 分鐘
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ) : null}
//         </DragOverlay>
//       </DndContext>

//       {/* 編輯表單彈窗 */}
//       {/* {(editingItem || isAddingItem) && (
//         <ItemEditForm
//           item={editingItem}
//           onSave={handleSaveItem}
//           onCancel={handleCancelEdit}
//         />
//       )} */}
//     </div>
//   );
// }

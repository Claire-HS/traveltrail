// "use client";

// import { useAuthCheck } from "@/hooks/useAuthCheck";
// import { useState, useEffect } from "react";
// import { db } from "@/library/firebase";
// import {
//   getDocs,
//   collection,
//   query,
//   doc,
//   deleteDoc,
//   updateDoc,
//   orderBy,
// } from "firebase/firestore";
// import {
//   Box,
//   Button,
//   Transition,
//   Tooltip,
//   Select,
//   Loader,
// } from "@mantine/core";
// import {
//   IconArrowBigRightLineFilled,
//   IconArrowBigLeftLineFilled,
// } from "@tabler/icons-react";
// import { notify } from "@/utilities/notify";
// // import PlaceItemCard from "@/components/PlaceItemCard";
// import DraggableItem from "@/components/DraggableItem";
// import {
// //   useDroppable,
//   SortableContext,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";

// interface PlaceDataProp {
//   id: string; // Google Place ID
//   name: string;
//   address: string;
//   location: {
//     lat: number;
//     lng: number;
//   };
//   note: string | null; // add from user
// }

// interface PlaceWithDocId extends PlaceDataProp {
//   docId: string;
// }

// interface SidebarListProps {
//   onExpandChange?: (expanded: boolean) => void;
// }

// export default function SidebarList({ onExpandChange }: SidebarListProps) {
//   const user = useAuthCheck();
//   const [userId, setUserId] = useState<string | null>(null);
//   const [expanded, setExpanded] = useState(false);
//   const [lists, setLists] = useState<any[]>([]);
//   const [selectedList, setSelectedList] = useState<string | null>(null);
//   const [listItems, setListItems] = useState<PlaceWithDocId[] | null>(null);
//   const [isFetchingLists, setIsFetchingLists] = useState(false);

//   // 取得user收藏清單列表
//   const fetchLists = async (uid: string) => {
//     setIsFetchingLists(true);
//     try {
//       const q = query(
//         collection(db, `users/${uid}/lists`),
//         orderBy("name", "desc")
//       );
//       const docSnap = await getDocs(q);
//       const data = docSnap.docs.map((doc) => {
//         return {
//           value: doc.id, // Firestore 清單文件ID
//           label: doc.data().name, //清單名稱
//         };
//       });
//       setLists(data);
//     } catch (error) {
//       console.error("取得清單失敗", error);
//       notify({ type: "error", message: "取得收藏清單失敗，請稍後再試！" });
//       setLists([]);
//     } finally {
//       setIsFetchingLists(false);
//     }
//   };

//   // 取得個別清單景點
//   const fetchListDetail = async () => {
//     if (userId && selectedList) {
//       try {
//         const ref = collection(
//           db,
//           `users/${userId}/lists/${selectedList}/places`
//         );
//         const placesSnap = await getDocs(ref);
//         const places: PlaceWithDocId[] = placesSnap.docs.map((doc) => {
//           const data = doc.data();
//           return {
//             docId: doc.id,
//             id: data.id, // Google Place ID
//             name: data.name,
//             address: data.address,
//             location: data.location,
//             note: data.note ?? null,
//           };
//         });
//         setListItems(places);
//       } catch (error) {
//         console.error("取得清單內容失敗", error);
//         notify({ type: "error", message: "取得清單景點失敗，請稍後再試！" });
//         setListItems(null);
//       }
//     } else {
//       setListItems(null);
//     }
//   };

//   // 更新景點備註
//   const handleUpdateNote = async (docId: string, newNote: string | null) => {
//     if (!userId || !selectedList) return;
//     try {
//       const ref = doc(
//         db,
//         "users",
//         userId,
//         "lists",
//         selectedList,
//         "places",
//         docId
//       );
//       await updateDoc(ref, { note: newNote });
//       setListItems((prev) =>
//         prev
//           ? prev.map((item) =>
//               item.docId === docId ? { ...item, note: newNote } : item
//             )
//           : prev
//       );
//     } catch (error) {
//       console.error("更新景點備註失敗", error);
//       notify({ type: "error", message: "更新備註失敗，請稍後再試！" });
//     }
//   };

//   // 刪除景點
//   const handleDelete = async (docId: string) => {
//     if (!userId || !selectedList) return;
//     try {
//       await deleteDoc(
//         doc(db, "users", userId, "lists", selectedList, "places", docId)
//       );
//       setListItems(
//         (prev) => prev?.filter((item) => item.docId !== docId) || []
//       );
//     } catch (error) {
//       console.error("景點刪除失敗", error);
//       notify({ type: "error", message: "景點刪除失敗，請稍後再試！" });
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       setUserId(user.uid);
//       fetchLists(user.uid);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchListDetail();
//   }, [userId, selectedList]);

//   useEffect(() => {
//     onExpandChange?.(expanded);
//   }, [expanded, onExpandChange]);

//   if (user === undefined) return null;

//   return (
//     <>
//       {/* 展開狀態：basis-1/4 */}
//       <Transition
//         mounted={expanded}
//         transition="fade-left"
//         duration={300}
//         timingFunction="ease"
//         keepMounted
//       >
//         {(styles) => (
//           <Box
//             style={styles}
//             className="h-full basis-1/4 bg-gray-200 p-3 relative flex flex-col"
//           >
//             <Button
//               variant="subtle"
//               onClick={() => setExpanded(false)}
//               size="compact-md"
//               className="mx-auto mb-2"
//             >
//               <IconArrowBigRightLineFilled size={30} />
//             </Button>
//             <div className="mb-3 text-center text-lg font-semibold ">
//               收藏清單
//             </div>

//             <Select
//               label="選擇清單:"
//               placeholder="清單名稱"
//               checkIconPosition="left"
//               data={lists}
//               value={selectedList}
//               onChange={setSelectedList}
//               clearable
//               searchable
//               nothingFoundMessage="找不到清單"
//             />
//             <div className="flex-1 mt-5 p-2 overflow-y-auto">
//               {selectedList === null ? null : listItems === null ? (
//                 <div className="mt-25 text-center">
//                   <Loader color="blue" size={30} />
//                 </div>
//               ) : listItems.length === 0 ? (
//                 <div className="mt-10 text-center text-gray-500">
//                   此清單尚無收藏任何地點
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center gap-4 justify-center">
//                   {listItems.map((item) => (
//                     <DraggableItem
//                       key={item.docId}
//                       placeData={item}
//                       onDelete={handleDelete}
//                       onUpdateNote={handleUpdateNote}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//           </Box>
//         )}
//       </Transition>

//       {/* 收合狀態：固定寬度 */}
//       {!expanded && (
//         <div
//           className="bg-gray-100 flex items-center justify-center flex-shrink-0"
//           style={{ flexBasis: expanded ? "25%" : "60px" }}
//         >
//           <Tooltip label="收藏清單" offset={7}>
//             <Button
//               variant="subtle"
//               onClick={() => setExpanded(true)}
//               size="compact-md"
//             >
//               <IconArrowBigLeftLineFilled size={30} />
//             </Button>
//           </Tooltip>
//         </div>
//       )}
//     </>
//   );
// }

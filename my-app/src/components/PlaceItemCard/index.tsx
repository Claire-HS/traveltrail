// import {
//   Card,
//   Text,
//   ActionIcon,
//   Modal,
//   Button,
//   Group,
//   Flex,
//   Image,
//   Textarea,
//   Menu,
// } from "@mantine/core";
// import { IconSettings, IconNotes } from "@tabler/icons-react";
// import { useState } from "react";

// interface PlaceWithDocId {
//   docId: string; // Firestore 文件ID
//   id: string; // Google Place ID
//   name: string;
//   address: string;
//   location: {
//     lat: number;
//     lng: number;
//   };
//   note: string | null; // add from user
// }

// interface PlaceItemCardProps {
//   placeData: PlaceWithDocId;
//   onDelete: (docId: string) => void;
//   onUpdateNote: (docId: string, newNote: string | null) => void;
// }

// export default function PlaceItemCard({
//   placeData,
//   onDelete,
//   onUpdateNote,
// }: PlaceItemCardProps) {
//   const [deleteModalOpened, setDeleteModalOpened] = useState(false);
//   const [editModalOpened, setEditModalOpened] = useState(false);
//   const [noteInput, setNoteInput] = useState(placeData.note || "");

//   // 刪除確認
//   const handleConfirmDelete = () => {
//     onDelete(placeData.docId);
//     setDeleteModalOpened(false);
//   };

//   // 編輯備註確認
//   const handleConfirmEditNote = () => {
//     onUpdateNote(
//       placeData.docId,
//       noteInput.trim() === "" ? null : noteInput.trim()
//     );
//     setEditModalOpened(false);
//   };

//   return (
//     <>
//       {/* 刪除確認 Modal */}
//       <Modal
//         opened={deleteModalOpened}
//         onClose={() => setDeleteModalOpened(false)}
//         title="確定要刪除這個地點嗎？"
//         centered
//       >
//         <Text mb="sm">
//           刪除後將無法恢復，確定要從清單中移除「{placeData.name}」嗎？
//         </Text>
//         <Group justify="flex-end">
//           <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
//             取消
//           </Button>
//           <Button color="red" onClick={handleConfirmDelete}>
//             確定刪除
//           </Button>
//         </Group>
//       </Modal>

//       {/* 編輯備註 Modal */}
//       <Modal
//         opened={editModalOpened}
//         onClose={() => setEditModalOpened(false)}
//         title={`編輯景點備註- ${placeData.name}`}
//         centered
//         size="sm"
//       >
//         <Textarea
//           placeholder="輸入內容"
//           value={noteInput}
//           onChange={(event) => setNoteInput(event.currentTarget.value)}
//           autosize
//           minRows={3}
//         />
//         <Group mt="md">
//           <Button variant="default" onClick={() => setEditModalOpened(false)}>
//             取消
//           </Button>
//           <Button onClick={handleConfirmEditNote}>儲存</Button>
//         </Group>
//       </Modal>

//       <>
//         <Flex gap={5} className="h-full">
//           <div className="w-[80px] bg-gray-500 rounded-md flex-shrink-0">
//             圖片
//           </div>
//           <div className="flex flex-col gap-y-1 w-0 flex-1 overflow-hidden">
//             <div className="font-medium text-lg truncate whitespace-nowrap">
//               {placeData.name}
//             </div>
//             <div className="text-sm truncate whitespace-nowrap">
//               {placeData.address}
//             </div>
//             <div className="flex items-center gap-1">
//               <IconNotes size={18} className="text-gray-500 flex-shrink-0" />
//               <div className="text-sm text-gray-500 truncate whitespace-nowrap">
//                 {placeData.note || "尚無備註"}
//               </div>
//             </div>
//           </div>
//           <Group className="absolute top-1 right-1 z-10">
//             <Menu shadow="md" width={160} withArrow>
//               <Menu.Target>
//                 <ActionIcon variant="transparent" color="gray">
//                   <IconSettings size={20} />
//                 </ActionIcon>
//               </Menu.Target>

//               <Menu.Dropdown>
//                 <Menu.Item onClick={() => setEditModalOpened(true)}>
//                   編輯備註
//                 </Menu.Item>

//                 <Menu.Item
//                   color="red"
//                   onClick={() => setDeleteModalOpened(true)}
//                 >
//                   刪除景點
//                 </Menu.Item>
//               </Menu.Dropdown>
//             </Menu>
//           </Group>
//         </Flex>
//       </>
//     </>
//   );
// }

// import { useDraggable } from "@dnd-kit/core";
// import ListItemCard from "@/components/ListItemCard";

// interface listItem {
//   id: string;
//   name: string;
//   address: string;
//   location: {
//     lat: number;
//     lng: number;
//   };
//   note: string | null;
// }

// export default function DraggableListItemCard({
//   item,
//   onDelete,
//   onUpdateNote,
// }: {
//   item: listItem;
//   onDelete: (id: string) => void;
//   onUpdateNote: (id: string, note: string | null) => void;
// }) {
//   const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
//     id: `sidebar-${item.id}`,
//     data: { place: item }, // 拖曳時帶上的資料
//   });

//   return (
//     <div
//       ref={setNodeRef}
//       {...listeners}
//       {...attributes}
//       className={`w-full ${isDragging ? "opacity-50" : ""}`}
//     >
//       <ListItemCard
//         item={item}
//         onDelete={onDelete}
//         onUpdateNote={onUpdateNote}
//       />
//     </div>
//   );
// }

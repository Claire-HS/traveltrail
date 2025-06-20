// import {
//   DndContext,
//   closestCorners,
//   DragOverlay,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   type DragStartEvent,
//   type DragEndEvent,
//   type DragOverEvent,
// } from "@dnd-kit/core";
// import { createContext, useContext } from "react";
// import { useDndState } from "./useDndState";
// import DraggableItem from "@/components/DraggableItem";

// const DndContextData = createContext<any>(null);
// export const useDndData = () => useContext(DndContextData);

// export default function DndProvider({
//   children,
//   initialContainers,
// }: {
//   children: React.ReactNode;
//   initialContainers: any;
// }) {
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
//   );
//   const dnd = useDndState(initialContainers);

//   const handleDragStart = ({ active }: DragStartEvent) => {
//     const containerId = dnd.findContainer(active.id as string);
//     const item = dnd.containers
//       .find((c) => c.id === containerId)
//       ?.items.find((i) => i.id === active.id);
//     dnd.setActiveItem(item || null);
//   };

//   const handleDragOver = ({ active, over }: DragOverEvent) => {
//     if (!over) return;
//     dnd.moveItemBetweenContainers(active.id as string, over.id as string);
//   };

//   const handleDragEnd = ({ active, over }: DragEndEvent) => {
//     dnd.setActiveItem(null);
//     if (!over) return;

//     const from = dnd.findContainer(active.id as string);
//     const to = dnd.findContainer(over.id as string) || over.id;

//     if (from === to) {
//       dnd.sortItemsWithinContainer(
//         from,
//         active.id as string,
//         over.id as string
//       );
//     }
//   };

//   return (
//     <DndContextData.Provider value={dnd}>
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCorners}
//         onDragStart={handleDragStart}
//         onDragOver={handleDragOver}
//         onDragEnd={handleDragEnd}
//       >
//         {children}

//         <DragOverlay>
//           {dnd.activeItem ? <DraggableItem item={dnd.activeItem} /> : null}
//         </DragOverlay>
//       </DndContext>
//     </DndContextData.Provider>
//   );
// }

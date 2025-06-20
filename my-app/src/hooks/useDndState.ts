// import { useState } from "react";
// // import type { Container, Item } from "@/types";

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

// interface Container {
//   id: string;
//   title: string;
//   items: PlaceWithDocId[];
// }

// export function useDndState(initial: Container[]) {
//   const [containers, setContainers] = useState<Container[]>(initial);
//   const [activeItem, setActiveItem] = useState<PlaceWithDocId | null>(null);

//   const findContainer = (id: string) => {
//     return containers.find((c) => c.items.some((i) => i.id === id))?.id || null;
//   };

//   const moveItemBetweenContainers = (activeId: string, overId: string) => {
//     const from = findContainer(activeId);
//     const to = findContainer(overId) || overId;
//     if (!from || !to || from === to) return;

//     setContainers((prev) => {
//       const fromIndex = prev.findIndex((c) => c.id === from);
//       const toIndex = prev.findIndex((c) => c.id === to);
//       const item = prev[fromIndex].items.find((i) => i.id === activeId);
//       if (!item) return prev;

//       const newFromItems = prev[fromIndex].items.filter(
//         (i) => i.id !== activeId
//       );
//       const newToItems = [...prev[toIndex].items, item];

//       const updated = [...prev];
//       updated[fromIndex] = { ...prev[fromIndex], items: newFromItems };
//       updated[toIndex] = { ...prev[toIndex], items: newToItems };

//       return updated;
//     });
//   };

//   const sortItemsWithinContainer = (
//     containerId: string,
//     activeId: string,
//     overId: string
//   ) => {
//     setContainers((prev) => {
//       const index = prev.findIndex((c) => c.id === containerId);
//       const items = [...prev[index].items];
//       const oldIndex = items.findIndex((i) => i.id === activeId);
//       const newIndex = items.findIndex((i) => i.id === overId);
//       if (oldIndex === -1 || newIndex === -1) return prev;

//       const [moved] = items.splice(oldIndex, 1);
//       items.splice(newIndex, 0, moved);

//       const updated = [...prev];
//       updated[index] = { ...prev[index], items };
//       return updated;
//     });
//   };

//   return {
//     containers,
//     setContainers,
//     activeItem,
//     setActiveItem,
//     findContainer,
//     moveItemBetweenContainers,
//     sortItemsWithinContainer,
//   };
// }

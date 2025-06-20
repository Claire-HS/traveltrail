// import { db } from "@/library/firebase"; // 根據你的專案結構調整
// import {
//   collection,
//   deleteDoc,
//   doc,
//   getDocs,
//   writeBatch,
// } from "firebase/firestore";

// /**
//  * 用來刪除整個行程（包含子集合：tempPlaces、days、places）
//  */
// export function useDeletePlan() {
//   const deleteEntirePlan = async (userId: string, planId: string) => {
//     const planRef = doc(db, "users", userId, "plans", planId);

//     try {
//       // 1. 刪除 tempPlaces
//       const tempSnap = await getDocs(collection(planRef, "tempPlaces"));
//       if (!tempSnap.empty) {
//         const batch1 = writeBatch(db);
//         tempSnap.forEach((doc) => batch1.delete(doc.ref));
//         await batch1.commit();
//       }

//       // 2. 刪除每一天底下的 places，再刪掉那天
//       const daysSnap = await getDocs(collection(planRef, "days"));
//       for (const dayDoc of daysSnap.docs) {
//         const placesSnap = await getDocs(collection(dayDoc.ref, "places"));
//         const batch2 = writeBatch(db);
//         placesSnap.forEach((placeDoc) => batch2.delete(placeDoc.ref));
//         batch2.delete(dayDoc.ref); // 最後刪掉 day 本身
//         await batch2.commit();
//       }

//       // 3. 刪除 plan 本身
//       await deleteDoc(planRef);

//       return { success: true };
//     } catch (error) {
//       console.error("刪除行程發生錯誤：", error);
//       return { success: false, error };
//     }
//   };

//   return { deleteEntirePlan };
// }

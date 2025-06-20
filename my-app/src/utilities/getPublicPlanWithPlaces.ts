import {
  collectionGroup,
  collection,
  getDocs,
  query,
  where,
  documentId,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/library/firebase";

export async function getPublicPlanWithPlaces(
  planId?: string,
  userId?: string
) {
  if (!planId || !userId) return null;

  const fullPath = `users/${userId}/plans/${planId}`;
  const docRef = doc(db, fullPath);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return null;

  const planInfo = snap.data();
  const planRef = snap.ref;

  const daysRef = collection(planRef, "days");
  const daysSnapshot = await getDocs(daysRef);

  const daysWithPlaces = [];

  for (const dayDoc of daysSnapshot.docs) {
    const dayInfo = dayDoc.data();
    const dayId = dayDoc.id;

    const placesRef = collection(dayDoc.ref, "places");
    const placesSnapshot = await getDocs(placesRef);

    const placesData = placesSnapshot.docs.map((placeDoc) => ({
      id: placeDoc.id,
      ...placeDoc.data(),
    }));

    daysWithPlaces.push({
      dayId,
      ...dayInfo,
      placesData,
    });
  }

  return {
    planId: snap.id,
    ...planInfo,
    days: daysWithPlaces,
  };
}

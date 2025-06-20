import {
  collectionGroup,
  collection,
  getDocs,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "@/library/firebase";

export async function getPublicPlanWithPlaces(
  planId?: string,
  userId?: string
) {
  if (!planId || !userId) return null;

  const fullPath = `users/${userId}/plans/${planId}`;
  const q = query(
    collectionGroup(db, "plans"),
    where(documentId(), "==", fullPath)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const planDoc = snap.docs[0];
  const planInfo = planDoc.data();
  const planRef = planDoc.ref;

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
    planId: planDoc.id,
    ...planInfo,
    days: daysWithPlaces,
  };
}

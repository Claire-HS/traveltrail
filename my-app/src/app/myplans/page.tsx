"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  Group,
  Collapse,
  Overlay,
} from "@mantine/core";
import {
  getDocs,
  collection,
  query,
  addDoc,
  where,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/library/firebase";
import { onAuthStateChanged } from "firebase/auth";
import CreatePlan from "@/components/CreatePlan";
import MyPlanCard from "@/components/MyPlanCard";

interface PlanInput {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  date?: string | null;
  note?: string | null;
}

export default function Page() {
  const user = useUser();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const [userId, setUserId] = useState<string | null>(null);

  const fetchPlans = async (uid: string) => {
    const q = query(collection(db, `users/${uid}/plans`));
    const docSnap = await getDocs(q);
    const data = docSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        planName: d.name,
        planStarDate: d.startDate,
        planEndDate: d.endDate,
        planNote: d.note,
      };
    });
    setPlans(data);
  };

  useEffect(() => {
    if (user === null) {
      router.replace("/");
    }
  }, [user, router]);

  // 查詢user現有的行程
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchPlans(user.uid);
      }
    });
    return () => unsub();
  }, []);

  // 新增行程
  const handleCreatePlan = async ({
    name,
    startDate,
    endDate,
    note,
  }: PlanInput) => {
    if (!name.trim() || !userId) return;
    try {
      const newPlanRef = doc(collection(db, `users/${userId}/plans`));
      await setDoc(newPlanRef, {
        name,
        startDate: startDate,
        endDate: endDate,
        note: note?.trim() || null,
        createdAt: serverTimestamp(),
      });
      const newPlanId = newPlanRef.id;
      setPlans((prev) => [...prev, { id: newPlanId, planName: name }]); //append plan
      alert("已新增行程！");
      setSelectedPlanId(newPlanId);
    } catch (error) {
      console.error("新增行程失敗", error);
      alert("新增行程失敗");
    }
  };

  return (
    <>
      <div className="h-[calc(100vh-160px)] w-[95vw] mt-10 mx-auto max-w-[1300px] flex flex-col">
        {/* <div className="text-3xl font-bold text-foreground">My Plans</div> */}

        <CreatePlan onCreate={handleCreatePlan}>
          {(showCreateUI) => (
            <div className="mb-4 flex justify-center">
              <Button
                size="md"
                radius="xl"
                color="#2C3E50"
                onClick={showCreateUI}
                styles={{
                  root: {
                    color: "#fdfcf9",
                    width: "200px",
                  },
                }}
              >
                建立新行程
              </Button>
            </div>
          )}
        </CreatePlan>

        <div className="flex justify-center mt-5 ">
          {plans.length === 0 && (
            <p className="text-3xl font-bold text-gray-600">
              尚無行程，請先建立。
            </p>
          )}
          {plans.length > 0 && (
            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 4 }}
              spacing={{ base: 10, sm: 40 }}
              verticalSpacing={{ base: "md", sm: "xl" }}
              className="mb-30"
            >
              {plans.map((plan) => (
                <MyPlanCard
                  key={plan.id}
                  imageSrc="/iceland.jpeg"
                  title={plan.planName}
                  travelDate={
                    plan.planStarDate && plan.planEndDate
                      ? `${plan.planStarDate} ～ ${plan.planEndDate}`
                      : "日期未定"
                  }
                  note={plan.planNote}
                  route="/"
                />
              ))}
            </SimpleGrid>
          )}
        </div>
      </div>
    </>
  );
}

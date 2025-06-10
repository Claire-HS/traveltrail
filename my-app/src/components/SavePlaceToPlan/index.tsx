"use client";
import { useEffect, useState, useRef } from "react";
import {
  getDocs,
  collection,
  query,
  addDoc,
  where,
  doc,
  setDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/library/firebase";
import HandlePlan from "@/components/HandlePlan";
import { notify } from "@/utilities/notify";
import {
  Modal,
  Button,
  Radio,
  Textarea,
  Text,
  Flex,
  Group,
  useModalsStack,
  ScrollArea,
} from "@mantine/core";
import { useUser } from "@/context/UserContext";

interface SavePlaceToPlanProps {
  placeData: any;
  opened: boolean;
  onClose: () => void;
}

interface PlanInput {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  note?: string | null;
}

interface Plan {
  id: string;
  planName: string;
}

export default function SavePlaceToPlan({
  placeData,
  opened,
  onClose,
}: SavePlaceToPlanProps) {
  const user = useUser();
  const userId = user?.uid ?? null;

  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [note, setNote] = useState("");
  const [isSavingPlace, setIsSavingPlace] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const lastItemRef = useRef<HTMLDivElement>(null);
  const stack = useModalsStack(["addPlace", "addNewPlan"]);

  const fetchPlans = async (uid: string) => {
    const q = query(
      collection(db, `users/${uid}/plans`),
      orderBy("createdAt", "desc")
    );
    const docSnap = await getDocs(q);
    const data = docSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        planName: d.name,
      };
    });
    setPlans(data);
  };

  // 當 userId 有變動時，自動抓行程
  useEffect(() => {
    if (userId) {
      fetchPlans(userId);
    } else {
      // user 登出時清空行程資料
      setPlans([]);
      setSelectedPlanId("");
      setNote("");
    }
  }, [userId]);

  // 景點加入行程
  const handleSave = async (planId: string) => {
    if (!userId) return;
    setIsSavingPlace(true);
    try {
      const placesRef = collection(
        db,
        `users/${userId}/plans/${planId}/places`
      );

      // 檢查景點有無重複(by id)
      const q = query(placesRef, where("id", "==", placeData.id));
      const placeSnap = await getDocs(q);
      if (!placeSnap.empty) {
        notify({ type: "warning", message: "地點已存在此行程！" });
        setIsSavingPlace(false);
        return;
      }

      await addDoc(placesRef, {
        ...placeData,
        note: note.trim(),
        createdAt: serverTimestamp(),
      });

      setNote("");
      setSelectedPlanId("");

      notify({ type: "saved", message: "成功加入行程！" });
      onClose();
    } catch (error) {
      console.error("景點儲存失敗", error);
      notify({ type: "error", message: "加入行程失敗！" });
    } finally {
      setIsSavingPlace(false);
    }
  };

  // 新增行程
  const handleCreatePlan = async ({
    name,
    startDate,
    endDate,
    note,
  }: PlanInput) => {
    if (!userId) return;
    setIsCreatingPlan(true);

    try {
      const newPlanRef = await addDoc(collection(db, `users/${userId}/plans`), {
        name,
        startDate: startDate || null,
        endDate: endDate || null,
        note: note?.trim() || null,
        createdAt: serverTimestamp(),
      });

      const newPlanId = newPlanRef.id;
      setPlans((prev) => [...prev, { id: newPlanId, planName: name }]); //append plan
      // notify({ type: "success", message: "新增成功！" });
      setSelectedPlanId(newPlanId);
      setTimeout(() => {
        lastItemRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (error) {
      console.error("新增行程失敗", error);
      notify({ type: "error", message: "新增行程失敗！" });
    } finally {
      setIsCreatingPlan(false);
    }
  };

  return (
    <Modal.Stack>
      <Modal
        {...stack.register("addPlace")}
        title="加入至行程"
        opened={opened}
        onClose={onClose}
        size="xs"
        centered
      >
        <Flex direction="column" gap="sm">
          <Button onClick={() => stack.open("addNewPlan")} color="#2C3E50">
            新增行程
          </Button>
          {plans.length === 0 ? (
            <Text size="sm" c="dimmed">
              尚無行程，請先建立。
            </Text>
          ) : (
            <>
              <Text size="sm" fw={500}>
                選擇行程：
              </Text>
              <Radio.Group
                value={selectedPlanId}
                onChange={setSelectedPlanId}
                name="selectedPlan"
              >
                <ScrollArea h={80} type="auto" scrollbarSize={6}>
                  <Flex direction="column" gap={4}>
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        ref={plan.id === selectedPlanId ? lastItemRef : null}
                      >
                        <Radio value={plan.id} label={plan.planName} />
                      </div>
                    ))}
                  </Flex>
                </ScrollArea>
              </Radio.Group>

              <Textarea
                label="地點備註"
                value={note}
                onChange={(e) => setNote(e.currentTarget.value)}
                placeholder="選填"
                autosize
                minRows={1}
              />
            </>
          )}

          <Group justify="space-between" pt="sm">
            <Button variant="default" onClick={onClose}>
              取消
            </Button>
            <Button
              onClick={() => handleSave(selectedPlanId)}
              disabled={!selectedPlanId}
              color="#2C3E50"
              loading={isSavingPlace}
            >
              確定
            </Button>
          </Group>
        </Flex>
      </Modal>
      <Modal
        {...stack.register("addNewPlan")}
        title="新增行程"
        centered
        size="xs"
        onClose={() => stack.close("addNewPlan")}
      >
        <HandlePlan
          onSubmit={(data) => {
            handleCreatePlan(data);
            stack.close("addNewPlan");
          }}
          onClose={() => stack.close("addNewPlan")}
          isLoading={isCreatingPlan}
        />
      </Modal>
    </Modal.Stack>
  );
}

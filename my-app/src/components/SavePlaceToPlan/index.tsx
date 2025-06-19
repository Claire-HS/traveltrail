"use client";
import { useEffect, useState, useRef } from "react";
import {
  getDocs,
  collection,
  query,
  addDoc,
  where,
  serverTimestamp,
  setDoc,
  orderBy,
  getDoc,
  doc,
  limit,
} from "firebase/firestore";
import { db } from "@/library/firebase";
import HandlePlan from "@/components/HandlePlan";
import { notify } from "@/utilities/notify";
import { fetchAndUploadPhoto } from "@/utilities/fetchAndUploadPhoto";
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
  const userName = user?.displayName;
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

  // 景點加入行程(暫存區)
  const handleSave = async (planId: string) => {
    if (!userId) return;
    setIsSavingPlace(true);
    try {
      // 查詢當前最大的 order 值
      const placesQuery = query(
        collection(db, "users", userId, "plans", planId, "tempPlaces"),
        orderBy("order", "desc"),
        limit(1)
      );
      const numSnap = await getDocs(placesQuery);
      let maxOrder = 0;
      if (!numSnap.empty) {
        maxOrder = numSnap.docs[0].data().order || 0;
      }
      const placesCol = collection(
        db,
        "users",
        userId,
        "plans",
        planId,
        "tempPlaces"
      );

      // 檢查是否已有相同 placeId（避免重複）
      const duplicateQuery = query(placesCol, where("id", "==", placeData.id));
      const duplicateSnap = await getDocs(duplicateQuery);
      if (!duplicateSnap.empty) {
        notify({ type: "warning", message: "地點已存在此行程！" });
        setIsSavingPlace(false);
        return;
      }

      // 儲存照片
      let uploadedPhotoUrl: string | null = null;
      // const firstPhoto = placeData.photos?.[0];
      if (placeData.photoName && placeData.id) {
        try {
          uploadedPhotoUrl = await fetchAndUploadPhoto(
            placeData.photoName,
            placeData.id
          );
        } catch (error) {
          console.warn("圖片處理失敗，略過圖片上傳", error);
        }
      }

      // 若無重複則新增
      await addDoc(placesCol, {
        ...placeData,
        note: note.trim() || null,
        photoUrl: uploadedPhotoUrl || null,
        order: maxOrder + 1, // 新景點的 order 為最大值 + 1
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      notify({ type: "saved", message: "成功加入行程！" });
      setNote("");
      setSelectedPlanId("");
      onClose();
    } catch (error) {
      console.error("景點儲存失敗", error);
      notify({ type: "error", message: "加入行程失敗！" });
      setNote("");
      setSelectedPlanId("");
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
        userName,
        name,
        startDate: startDate || null,
        endDate: endDate || null,
        note: note?.trim() || null,
        totalDays: 0, // 新增時預設為0
        isPublic: false, // 新增時預設不公開
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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

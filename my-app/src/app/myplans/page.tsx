"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { SimpleGrid, Button, Modal, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  getDocs,
  collection,
  query,
  addDoc,
  serverTimestamp,
  orderBy,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/library/firebase";
import HandlePlan from "@/components/HandlePlan";
import MyPlanCard from "@/components/MyPlanCard";
import PrivacySettingModalContent from "@/components/PrivacySettingModalContent";
import { notify } from "@/utilities/notify";

interface PlanInput {
  name: string;
  startDate: string | null;
  endDate: string | null;
  note: string | null;
}
interface Plans extends PlanInput {
  id: string;
  isPublic: boolean;
  createdAt?: Date;
}

interface EditPlan extends PlanInput {
  id: string;
}

export default function Page() {
  const user = useUser();
  const router = useRouter();
  const [plans, setPlans] = useState<Plans[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [isSettingPublic, setIsSettingPublic] = useState(false);
  const [addNewPlanOpened, { open: openAddNewPlan, close: closeAddNewPlan }] =
    useDisclosure(false);
  const [
    confirmDeleteOpened,
    { open: openConfirmDelete, close: closeConfirmDelete },
  ] = useDisclosure(false);
  const [editPlanOpened, { open: openEditPlan, close: closeEditPlan }] =
    useDisclosure(false);
  const [editPublicOpened, { open: openEditPublic, close: _closeEditPublic }] =
    useDisclosure(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const [editPlanData, setEditPlanData] = useState<PlanInput | undefined>(
    undefined
  );
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [targetPlan, setTargetPlan] = useState<{
    id: string;
    isPublic: boolean;
  } | null>(null);
  const [isPublicState, setIsPublicState] = useState<boolean | null>(null);

  // 新增行程
  const handleCreatePlan = async ({
    name,
    startDate,
    endDate,
    note,
  }: PlanInput) => {
    if (!user) return;
    setIsCreatingPlan(true);

    try {
      const newPlanRef = await addDoc(
        collection(db, `users/${user.uid}/plans`),
        {
          name,
          startDate: startDate || null,
          endDate: endDate || null,
          note: note?.trim() || null,
          isPublic: false, // 新增時預設不公開
          createdAt: serverTimestamp(),
        }
      );

      const newPlanId = newPlanRef.id;
      const newPlanSnap = await getDoc(newPlanRef);
      const newPlanData = newPlanSnap.data();
      const newCreatedAt = newPlanData?.createdAt
        ? newPlanData.createdAt.toDate()
        : new Date();

      setPlans((prev) =>
        [
          ...prev,
          {
            id: newPlanId,
            name: name,
            startDate: startDate || null,
            endDate: endDate || null,
            note: note?.trim() || null,
            isPublic: false,
            createdAt: newCreatedAt,
          },
        ].sort((a, b) => {
          const aTime = a.createdAt ? a.createdAt.getTime() : 0;
          const bTime = b.createdAt ? b.createdAt.getTime() : 0;
          return bTime - aTime;
        })
      );
      // notify({ type: "success", message: "新增成功！" });
      closeAddNewPlan();
    } catch (error) {
      console.error("新增行程失敗", error);
      notify({ type: "error", message: "新增行程失敗！" });
    } finally {
      setIsCreatingPlan(false);
    }
  };

  // 修改行程
  const handleEditPlan = (plan: EditPlan) => {
    setEditPlanId(plan.id);
    setEditPlanData({
      name: plan.name,
      startDate: plan.startDate,
      endDate: plan.endDate,
      note: plan.note,
    });
    openEditPlan();
  };

  const handleUpdatePlan = async ({
    name,
    startDate,
    endDate,
    note,
  }: PlanInput) => {
    if (!user || !editPlanId) {
      notify({ type: "error", message: "無法取得使用者或行程" });
      return;
    }

    setIsUpdatingPlan(true);
    try {
      const planRef = doc(db, `users/${user.uid}/plans/${editPlanId}`);
      await updateDoc(planRef, {
        name,
        startDate: startDate || null,
        endDate: endDate || null,
        note: note?.trim() || null,
      });

      // 更新UI
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === editPlanId
            ? {
                ...plan,
                name,
                startDate,
                endDate,
                note: note?.trim() || null,
              }
            : plan
        )
      );

      notify({ type: "success", message: "行程已更新！" });
      closeEditPlan();
    } catch (error) {
      console.error("更新行程失敗", error);
      notify({ type: "error", message: "更新行程失敗，請稍後再試！" });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // 刪除行程
  const confirmDeletePlan = (id: string) => {
    setPlanToDelete(id); // 暫存 ID
    openConfirmDelete();
  };

  const handleDeletePlan = async () => {
    if (!user || !planToDelete) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/plans/${planToDelete}`));
      setPlans((prev) => prev.filter((plan) => plan.id !== planToDelete));
      notify({ type: "success", message: "已刪除行程！" });
    } catch (error) {
      console.error("刪除行程失敗", error);
      notify({ type: "error", message: "無法刪除行程，請稍後再試！" });
    } finally {
      setPlanToDelete(null);
      closeConfirmDelete();
    }
  };

  // 隱私設定
  const handleSetPublic = async (id: string, currentIsPublic: boolean) => {
    if (!user) return;
    setIsSettingPublic(true);

    try {
      const planRef = doc(db, `users/${user.uid}/plans/${id}`);
      await updateDoc(planRef, {
        isPublic: !currentIsPublic,
      });

      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === id ? { ...plan, isPublic: !currentIsPublic } : plan
        )
      );

      // 同步更新 Modal 內的狀態
      setTargetPlan((prev) =>
        prev ? { ...prev, isPublic: !currentIsPublic } : prev
      );
      setIsPublicState(!currentIsPublic);

      notify({
        type: "success",
        message: `行程已設為${!currentIsPublic ? "公開" : "私人"}`,
      });
    } catch (error) {
      console.error("切換公開狀態失敗", error);
      notify({ type: "error", message: "切換公開狀態失敗，請稍後再試！" });
    } finally {
      setIsSettingPublic(false);
    }
  };

  const closeEditPublic = () => {
    setTargetPlan(null);
    setIsPublicState(null);
    _closeEditPublic(); // 關掉 Modal
  };

  // 未登入處理
  useEffect(() => {
    if (user === null) {
      router.replace("/");
    }
  }, [user]);

  // 取得使用者plans
  useEffect(() => {
    if (!user) {
      setPlans([]);
      setIsFetching(false);
      return;
    }

    const fetchPlans = async () => {
      setIsFetching(true);
      try {
        const q = query(
          collection(db, `users/${user.uid}/plans`),
          orderBy("createdAt", "desc")
        );
        const docSnap = await getDocs(q);
        const data = docSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name,
            startDate: d.startDate ?? null,
            endDate: d.endDate ?? null,
            note: d.note ?? null,
            isPublic: d.isPublic,
            createdAt: d.createdAt ? d.createdAt.toDate() : new Date(0),
          };
        });
        setPlans(data);
      } catch (error) {
        console.error("取得行程失敗", error);
        setPlans([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchPlans();
  }, [user]);

  useEffect(() => {
    if (targetPlan) {
      setIsPublicState(targetPlan.isPublic);
    }
  }, [targetPlan]);

  // 尚未確認登入狀態
  if (user === undefined) return null;

  return (
    <>
      <div className="w-[95vw] mt-10 mx-auto max-w-[1300px] flex flex-col gap-7 ">
        <Modal
          opened={confirmDeleteOpened}
          onClose={closeConfirmDelete}
          title="確定要刪除這個行程嗎？"
          centered
          size="xs"
        >
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="default" onClick={closeConfirmDelete}>
              取消
            </Button>
            <Button color="red" onClick={handleDeletePlan}>
              確定刪除
            </Button>
          </div>
        </Modal>
        <Modal
          opened={addNewPlanOpened}
          onClose={closeAddNewPlan}
          title="建立新行程"
          size="xs"
          centered
        >
          <HandlePlan
            onSubmit={handleCreatePlan}
            onClose={closeAddNewPlan}
            isLoading={isUpdatingPlan}
          ></HandlePlan>
        </Modal>
        <Modal
          opened={editPlanOpened}
          onClose={closeEditPlan}
          title="修改行程資訊"
          size="xs"
          centered
        >
          <HandlePlan
            onClose={closeEditPlan}
            onSubmit={handleUpdatePlan}
            isLoading={isCreatingPlan}
            defaultData={
              editPlanData
                ? { ...editPlanData, note: editPlanData.note ?? "" }
                : undefined
            }
            mode="edit"
          ></HandlePlan>
        </Modal>
        <Modal
          opened={editPublicOpened}
          onClose={closeEditPublic}
          title="隱私設定"
          size="xs"
          centered
        >
          <PrivacySettingModalContent
            settingData={targetPlan ?? undefined}
            currentIsPublic={isPublicState ?? false}
            onPrivacyChange={(id, currentIsPublic) => {
              handleSetPublic(id, currentIsPublic);
            }}
            isLoading={isSettingPublic}
            onClose={closeEditPublic}
          />
        </Modal>

        <Button
          onClick={openAddNewPlan}
          color="#2C3E50"
          radius="xl"
          size="md"
          w={200}
          className="self-center"
        >
          建立新行程
        </Button>

        <div className="overflow-y-auto flex-1 min-h-[300px] max-h-[calc(100vh-250px)]">
          {isFetching ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader size="xl" color="#2C3E50" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-3xl font-bold text-gray-600 mt-25">
              尚無行程，請先建立。
            </p>
          ) : (
            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 4 }}
              spacing={{ base: 10, sm: 30 }}
              verticalSpacing={{ base: "md", sm: "xl" }}
              className="mx-2 mt-2 mb-30"
            >
              {plans.map((plan) => (
                <div key={plan.id} className="flex justify-center">
                  <MyPlanCard
                    key={plan.id}
                    imageSrc="/iceland.jpeg"
                    title={plan.name}
                    travelDate={
                      plan.startDate && plan.endDate
                        ? `${plan.startDate} ～ ${plan.endDate}`
                        : "日期未定"
                    }
                    note={plan.note}
                    route="/planning"
                    isPublic={plan.isPublic}
                    onDeleteClick={() => confirmDeletePlan(plan.id)}
                    onEditClick={() => handleEditPlan(plan)}
                    onPrivacyClick={() => {
                      setTargetPlan({ id: plan.id, isPublic: plan.isPublic });
                      setTimeout(() => openEditPublic(), 0);
                    }}
                  />
                </div>
              ))}
            </SimpleGrid>
          )}
        </div>
      </div>
    </>
  );
}

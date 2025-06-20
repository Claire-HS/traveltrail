import { useState, useCallback, useMemo, useEffect } from "react";
import { SimpleGrid, Button, Group, Loader } from "@mantine/core";
import {
  collectionGroup,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/library/firebase";
import PublicPlanCard from "@/components/PublicPlanCard";
import { notify } from "@/utilities/notify";

interface Plan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  ownerName: string;
  imageSrc: string;
  userId: string;
}
const PAGE_SIZE = 4;

export default function PublicPlansGrid() {
  const [plans, setPlans] = useState<Plan[][]>([]);
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [pageDocs, setPageDocs] = useState<QueryDocumentSnapshot[]>([]);
  const [hasNext, setHasNext] = useState(true);
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  const fetchPlans = useCallback(
    async (pageIndex: number): Promise<boolean> => {
      if (plans[pageIndex]) return true; //已有快取

      setIsFetching(true);
      try {
        let q = query(
          collectionGroup(db, "plans"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE)
        );

        if (pageIndex > 0 && pageDocs[pageIndex - 1]) {
          q = query(q, startAfter(pageDocs[pageIndex - 1]));
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;

        if (docs.length === 0) {
          // 該頁無資料，代表無下一頁
          setHasNext(false);
          return false;
        }

        const newPlans: Plan[] = docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            ownerName: data.userName,
            imageSrc: data.imageSrc || "/iceland.jpeg",
            userId: data.userId,
          };
        });

        setPlans((prev) => {
          const copy = [...prev];
          copy[pageIndex] = newPlans;
          return copy;
        });

        setPageDocs((prev) => {
          const copy = [...prev];
          copy[pageIndex] = docs[docs.length - 1];
          return copy;
        });

        setHasNext(docs.length === PAGE_SIZE);

        return true;
      } catch (error) {
        notify({
          type: "error",
          message: `載入行程失敗：${(error as Error).message}`,
        });
        return false;
      } finally {
        setIsFetching(false);
      }
    },
    [plans, pageDocs]
  );

  useEffect(() => {
    fetchPlans(0);
  }, [fetchPlans]);

  // 按下一頁：先 fetch ，成功才 setPage
  const handleNext = async () => {
    if (isFetching || !hasNext) return;

    const nextPage = page + 1;
    setPendingPage(nextPage);

    const loaded = await fetchPlans(nextPage);

    setPendingPage(null);

    if (loaded) {
      setPage(nextPage);
    } else {
      notify({
        type: "info",
        message: "已經是最後一頁了！",
      });
      setHasNext(false);
    }
  };

  const handlePrev = () => {
    if (isFetching || page === 0) return;

    setPage((prev) => prev - 1);
    setHasNext(true);
  };

  // 用 useMemo 讓 disabled 狀態穩定不閃爍
  const isNextDisabled = useMemo(() => {
    return isFetching || !hasNext || pendingPage !== null;
  }, [isFetching, hasNext, pendingPage]);

  const isPrevDisabled = useMemo(() => {
    return isFetching || page === 0 || pendingPage !== null;
  }, [isFetching, page, pendingPage]);

  return (
    <>
      {isFetching && plans.length === 0 ? (
        <Loader size="xl" type="bars" color="#2C3E50" />
      ) : (
        <>
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 4 }}
            spacing={{ base: 10, sm: 40 }}
            verticalSpacing={{ base: "md", sm: "xl" }}
            className="mt-20"
          >
            {plans[page]?.map((plan) => (
              <PublicPlanCard
                key={plan.id}
                imageSrc={plan.imageSrc}
                title={plan.name}
                travelDate={`${plan.startDate} ~ ${plan.endDate}`}
                ownerName={plan.ownerName}
                route={`/sharing?user=${plan.userId}&id=${plan.id}`}
              />
            ))}
          </SimpleGrid>

          <Group justify="center" mt="xl">
            <Button
              onClick={handlePrev}
              disabled={isPrevDisabled}
              variant="default"
              radius="lg"
            >
              上一頁
            </Button>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
              color="#2C3E50"
              radius="lg"
            >
              下一頁
            </Button>
          </Group>
        </>
      )}
    </>
  );
}

import { useEffect, useState, useCallback } from "react";
import { SimpleGrid, Button, Group, Loader } from "@mantine/core";
import {
  collectionGroup,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/library/firebase";
import PublicPlanCard from "@/components/PublicPlanCard";
import { notify } from "@/utilities/notify";

interface Plan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  ownerName: string;
  imageSrc: string;
}
const PAGE_SIZE = 4;

export default function PublicPlansGrid() {
  const [plans, setPlans] = useState<Plan[][]>([]);
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [pageDocs, setPageDocs] = useState<any[]>([]);
  const [hasNextPages, setHasNextPages] = useState<boolean[]>([]);

  const fetchPlans = useCallback(
    async (pageIndex: number) => {
      if (plans[pageIndex]) return;
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

        const newPlans = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.name,
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            ownerName: data.userName,
            imageSrc: data.imageSrc || "/iceland.jpeg",
          };
        });

        setPlans((prev) => {
          const copy = [...prev];
          copy[pageIndex] = newPlans;
          return copy;
        });
        setPageDocs((prev) => {
          const copy = [...prev];
          // 儲存 pageIndex 對應頁面的最後一筆 doc
          if (snapshot.docs.length > 0) {
            copy[pageIndex] = snapshot.docs[snapshot.docs.length - 1];
          }
          return copy;
        });
        setHasNextPages((prev) => {
          const copy = [...prev];
          copy[pageIndex] = snapshot.size === PAGE_SIZE;
          return copy;
        });
      } catch (error) {
        notify({
          type: "error",
          message: `載入行程失敗：${(error as Error).message}`,
        });
      } finally {
        setIsFetching(false);
      }
    },
    [plans, pageDocs]
  );

  useEffect(() => {
    fetchPlans(page);
  }, [page, fetchPlans]);

  const handleNext = () => {
    if (!isFetching && hasNextPages[page]) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!isFetching && page > 0) setPage((prev) => prev - 1);
  };

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
                title={plan.title}
                travelDate={`${plan.startDate} ~ ${plan.endDate}`}
                ownerName={plan.ownerName}
                route={`/sharing/${plan.id}`}
              />
            ))}
          </SimpleGrid>

          <Group justify="center" mt="xl">
            <Button
              onClick={handlePrev}
              disabled={page === 0 || isFetching}
              variant="default"
            >
              上一頁
            </Button>
            <Button
              onClick={handleNext}
              disabled={!hasNextPages[page] || isFetching}
            >
              下一頁
            </Button>
          </Group>
        </>
      )}
    </>
  );
}

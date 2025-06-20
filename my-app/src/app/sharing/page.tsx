import { Suspense } from "react";
import { Loader, Center } from "@mantine/core";
import PlanningClient from "./PlanningClient";

export default function SharingPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "100vh" }}>
          <Loader color="blue" size="xl" />
        </Center>
      }
    >
      <PlanningClient />
    </Suspense>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import PublicPlaceCard from "@/components/PublicPlaceCard";
// import { getPublicPlanWithPlaces } from "@/utilities/getPublicPlanWithPlaces";
// import { Loader } from "@mantine/core";

// export default function SharingPage() {
//   const searchParams = useSearchParams();
//   const planId = searchParams.get("id");
//   const userId = searchParams.get("user");
//   const [plan, setPlan] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadPlans = async () => {
//       if (planId && userId) {
//         const planData = await getPublicPlanWithPlaces(planId, userId);
//         setPlan(planData);
//         setLoading(false);
//       }
//     };
//     loadPlans();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader />
//       </div>
//     );
//   }

//   console.log("plan=", plan);

//   return (
//     <>
//       <div className="w-full relative">
//         <PublicPlaceCard planData={plan} />
//       </div>
//     </>
//   );
// }

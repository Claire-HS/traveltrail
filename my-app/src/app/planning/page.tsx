import { Suspense } from "react";
import PlanningClient from "./PlanningClient";

export default function PlanningPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanningClient />
    </Suspense>
  );
}

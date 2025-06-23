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

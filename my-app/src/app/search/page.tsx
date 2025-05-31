"user client";
// import SearchInput from "@/components/SearchInput";
// import { IconMapSearch } from "@tabler/icons-react";
// import { Container, Paper } from "@mantine/core";
import MapWithPlaceAutocomplete from "@/components/Map";
import Script from "next/script";
// import SavePlaceToList from "@/components/SavePlaceToList";

export default function page() {
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=beta&libraries=places`}
        strategy="beforeInteractive"
        async
      />
      <div className="h-[calc(100vh-160px)] w-[95vw] mt-5 mx-auto max-w-[1300px] shadow-lg shadow-foreground/50 relative ">
        <MapWithPlaceAutocomplete />
      </div>
    </>
  );
}

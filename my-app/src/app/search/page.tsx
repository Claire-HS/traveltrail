"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapWithPlaceAutocomplete from "@/components/Map";
import Script from "next/script";
import { useUser } from "@/context/UserContext";

export default function page() {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps) {
      setIsGoogleLoaded(true);
    }
  }, []);

  // 尚未確認登入狀態時不渲染任何內容（避免閃爍）
  if (user === undefined) return null;

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=beta&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          setIsGoogleLoaded(true); // 確保 google 載入完成後再渲染地圖
        }}
      />
      <div className="h-[calc(100vh-160px)] w-[95vw] mt-5 mx-auto max-w-[1300px] shadow-lg shadow-foreground/50 relative ">
        {user && isGoogleLoaded && <MapWithPlaceAutocomplete />}
      </div>
    </>
  );
}

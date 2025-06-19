import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/library/firebase";

export async function fetchAndUploadPhoto(
  photoName: string,
  placeId: string
): Promise<string | null> {
  try {
    const apiUrl = `/api/placepic?photoName=${encodeURIComponent(
      photoName
    )}&maxWidth=400`;

    // console.log("[fetchAndUploadPhoto] 呼叫圖片 API:", apiUrl);

    // 先試著下載圖片，確認是否成功
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(
        `[fetchAndUploadPhoto] 圖片 API 請求失敗，狀態碼: ${res.status}`
      );
    }
    const blob = await res.blob();

    // console.log(
    //   "[fetchAndUploadPhoto] 下載圖片成功，大小:",
    //   blob.size,
    //   "bytes"
    // );

    // 根據 blob mime type 決定副檔名
    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    const ext = extMap[blob.type] ?? "";

    const storagePath = `placePhotos/${placeId}${ext}`;
    const storageRef = ref(storage, storagePath);

    // 先檢查圖片是否已存在
    try {
      const existingUrl = await getDownloadURL(storageRef);
      //   console.log(
      //     "[fetchAndUploadPhoto] 圖片已存在，使用現有 URL:",
      //     existingUrl
      //   );
      return existingUrl;
    } catch (e) {
      //   console.log("[fetchAndUploadPhoto] 圖片不存在，開始上傳");
    }

    // 上傳圖片
    await uploadBytes(storageRef, blob, {
      contentType: blob.type,
    });

    // 取得上傳後的 URL
    const downloadURL = await getDownloadURL(storageRef);
    // console.log("[fetchAndUploadPhoto] 圖片上傳成功，URL:", downloadURL);

    return downloadURL;
  } catch (err) {
    console.error("[fetchAndUploadPhoto] 圖片處理失敗", err);
    return null;
  }
}

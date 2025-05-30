import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const photoName = searchParams.get("photoName");
  const maxWidth = searchParams.get("maxWidth") ?? "400";

  if (!photoName) {
    return new Response("Missing photoName", { status: 400 });
  }

  const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&maxWidthPx=${maxWidth}`;

  const response = await fetch(photoUrl);

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

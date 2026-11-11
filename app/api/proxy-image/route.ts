import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Validate protocol
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid url protocol" }, { status: 400 });
    }

    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch image: ${res.statusText}` }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: any) {
    console.error("Proxy image error:", error);
    return NextResponse.json({ error: error.message || "Failed to proxy image" }, { status: 500 });
  }
}


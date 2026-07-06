import { NextResponse } from "next/server";
import { nextRiddle } from "../../lib/kimia";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const currentQuestion = url.searchParams.get("current") || "";
  const recentQuestions = url.searchParams.getAll("recent").filter(Boolean);

  return NextResponse.json(nextRiddle(currentQuestion, recentQuestions), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store"
    }
  });
}

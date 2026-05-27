import { NextResponse } from "next/server";
import { getInsights } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channel = url.searchParams.get("channel");
  if (!channel) {
    return NextResponse.json({ error: "missing_channel" }, { status: 400 });
  }

  const insights = getInsights(channel);
  return NextResponse.json({
    channel,
    transcript: insights.transcript.slice(-40),
    updatedAt: Date.now(),
  });
}

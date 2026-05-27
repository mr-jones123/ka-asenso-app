import { NextResponse } from "next/server";
import { queryConvoAiAgent } from "@/lib/agora-convoai";
import { getChannelSession } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channel = url.searchParams.get("channel");
  const directAgentId = url.searchParams.get("agentId");

  const agentId = directAgentId ?? (channel ? getChannelSession(channel)?.agentId : undefined);
  if (!agentId) {
    return NextResponse.json({ error: "no_agent_id" }, { status: 404 });
  }

  const status = await queryConvoAiAgent(agentId);
  return NextResponse.json({ agentId, status });
}

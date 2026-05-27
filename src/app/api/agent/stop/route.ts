import { NextResponse } from "next/server";
import { z } from "zod";
import { stopConvoAiAgent } from "@/lib/agora-convoai";
import { clearChannel, getChannelSession } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const StopSchema = z.object({
  channel: z.string().min(3).max(64).optional(),
  agentId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  let body: { channel?: string; agentId?: string };
  try {
    body = (await request.json()) as { channel?: string; agentId?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = StopSchema.safeParse(body);
  if (!parsed.success || (!parsed.data.channel && !parsed.data.agentId)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  let agentId = parsed.data.agentId;
  if (!agentId && parsed.data.channel) {
    agentId = getChannelSession(parsed.data.channel)?.agentId;
  }

  if (!agentId) {
    return NextResponse.json({ error: "unknown_agent" }, { status: 404 });
  }

  try {
    const result = await stopConvoAiAgent(agentId);
    if (parsed.data.channel) clearChannel(parsed.data.channel);
    return NextResponse.json({ stopped: true, raw: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: "agent_stop_failed", message }, { status: 500 });
  }
}

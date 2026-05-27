import { NextResponse } from "next/server";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import { z } from "zod";
import { env } from "@/lib/env";
import { startConvoAiAgent } from "@/lib/agora-convoai";
import { ARA_FAILURE_MESSAGE, ARA_GREETING, buildSalesPrompt } from "@/lib/sales-prompt";
import { registerChannel } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const StartSchema = z.object({
  channel: z.string().min(3).max(64),
  remoteUid: z.string().min(1),
});

const AGENT_TOKEN_TTL = 60 * 60;

export async function POST(request: Request) {
  let body: { channel?: string; remoteUid?: string };
  try {
    body = (await request.json()) as { channel?: string; remoteUid?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = StartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { channel, remoteUid } = parsed.data;

  try {
    const agentRtcUid = `maya-${Math.floor(Math.random() * 1_000_000)}`;
    const expireAt = Math.floor(Date.now() / 1000) + AGENT_TOKEN_TTL;
    const agentRtcToken = RtcTokenBuilder.buildTokenWithUserAccount(
      env.agoraAppId,
      env.agoraAppCertificate,
      channel,
      agentRtcUid,
      RtcRole.PUBLISHER,
      AGENT_TOKEN_TTL,
      expireAt,
    );

    const joined = await startConvoAiAgent({
      channel,
      remoteUid,
      agentName: `ka-asenso-${channel}-${Date.now()}`,
      agentRtcUid,
      agentRtcToken,
      greeting: ARA_GREETING,
      failureMessage: ARA_FAILURE_MESSAGE,
      systemPrompt: buildSalesPrompt(),
    });

    const agentId = (joined.agent_id ?? "") as string;
    if (!agentId) {
      return NextResponse.json(
        { error: "no_agent_id", raw: joined },
        { status: 502 },
      );
    }

    registerChannel(channel, {
      agentId,
      channel,
      remoteUid,
      startedAt: Date.now(),
    });

    return NextResponse.json({
      agentId,
      channel,
      remoteUid,
      agentRtcUid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: "agent_start_failed", message }, { status: 500 });
  }
}

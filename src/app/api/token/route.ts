import { NextResponse } from "next/server";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TOKEN_TTL_SECONDS = 60 * 60;

// Always mint a string-UID token so it matches the agent join body
// (enable_string_uid: true) and avoids cross-UID-type channel issues.
export async function POST(request: Request) {
  let payload: { channel?: string; uid?: string } = {};
  try {
    payload = await request.json();
  } catch {
    // empty body ok
  }

  const channel = (payload.channel ?? `ka-asenso-${Date.now()}`).toString();
  const uid = (payload.uid ?? `buyer-${Math.floor(Math.random() * 1_000_000)}`).toString();

  try {
    const expireAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      env.agoraAppId,
      env.agoraAppCertificate,
      channel,
      uid,
      RtcRole.PUBLISHER,
      TOKEN_TTL_SECONDS,
      expireAt,
    );

    return NextResponse.json({
      appId: env.agoraAppId,
      channel,
      uid,
      token,
      expiresAt: expireAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ error: "token_mint_failed", message }, { status: 500 });
  }
}

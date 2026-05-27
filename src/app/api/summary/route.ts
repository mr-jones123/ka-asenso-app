import { NextResponse } from "next/server";
import { z } from "zod";
import { getInsights, upsertLead } from "@/lib/runtime-store";
import { summarizeLead } from "@/lib/lead-summarizer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SummarySchema = z.object({
  channel: z.string().min(3),
});

export async function POST(request: Request) {
  let body: { channel?: string };
  try {
    body = (await request.json()) as { channel?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = SummarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const insights = getInsights(parsed.data.channel);
  if (insights.transcript.length === 0) {
    return NextResponse.json({ error: "empty_transcript" }, { status: 400 });
  }

  try {
    const lead = await summarizeLead(parsed.data.channel, insights.transcript);
    upsertLead(lead);
    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const isParseError = message.startsWith("summary_json") || message.startsWith("summary_schema");
    return NextResponse.json(
      { error: isParseError ? "summary_parse_failed" : "summary_failed", detail: message },
      { status: isParseError ? 422 : 500 },
    );
  }
}

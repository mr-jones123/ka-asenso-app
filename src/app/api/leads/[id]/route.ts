import { NextResponse } from "next/server";
import { getLead } from "@/lib/runtime-store";

interface Params {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const lead = getLead(id);
  if (!lead) {
    return NextResponse.json({ error: "lead_not_found" }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

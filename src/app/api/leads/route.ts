import { NextResponse } from "next/server";
import { listLeads } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ leads: listLeads() });
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { env } from "@/lib/env";
import { franchiseCatalog } from "@/lib/mock-data";
import type { LeadRecord, DealStage, ManagementStyle, CustomerType, FranchiseBrand } from "@/lib/types";
import type { TranscriptEntry } from "@/lib/runtime-store";

const SummarySchema = z.object({
  investor_name: z.string().default("Unnamed Buyer"),
  email: z.string().default(""),
  phone: z.string().default(""),
  customer_type: z.enum(["ofw", "local"]).default("local"),
  customer_label: z.string().default("New Lead"),
  budget_text: z.string().default("Unknown"),
  budget_value: z.number().nonnegative().default(0),
  preferred_industry: z.string().default("Unknown"),
  target_location: z.string().default("Unknown"),
  management_style: z.enum(["hands_on", "family_managed", "semi_passive"]).default("hands_on"),
  timeline: z.string().default("Unknown"),
  recommended_brand_id: z.string().default(""),
  recommended_brand_name: z.string().default(""),
  recommendation_reason: z.string().default(""),
  market_signal: z.string().default(""),
  risk_flags: z.array(z.string()).default([]),
  objections_raised: z.array(z.string()).default([]),
  conversation_summary: z.string().default(""),
  next_action: z
    .enum(["book_consultation", "send_brochure", "follow_up_call", "no_interest"])
    .default("follow_up_call"),
  stage: z
    .enum(["qualified", "pitched", "closed", "follow_up", "no_interest", "in_consultation", "hot_lead", "new_lead", "high_intent"])
    .default("qualified"),
});

type Summary = z.infer<typeof SummarySchema>;

function computeFitScore(s: Summary, brand: FranchiseBrand | undefined): number {
  if (!brand) return 0;
  let score = 0;
  if (s.budget_value && s.budget_value >= brand.capitalMin && s.budget_value <= brand.capitalMax) {
    score += 30;
  }
  if (
    s.preferred_industry &&
    brand.category.toLowerCase().includes(s.preferred_industry.toLowerCase())
  ) {
    score += 25;
  }
  if (brand.strongProvinces.some((p) => s.target_location.toLowerCase().includes(p.toLowerCase()))) {
    score += 20;
  } else {
    score += 10;
  }
  if (s.management_style === brand.managementStyle) {
    score += 15;
  }
  if (brand.trending) {
    score += 10;
  }
  return Math.min(100, score);
}

function stageToLabel(stage: DealStage): string {
  switch (stage) {
    case "hot_lead": return "Hot Lead";
    case "in_consultation": return "In Consultation";
    case "new_lead": return "New Lead";
    case "high_intent": return "High Intent";
    case "closed": return "Closed";
    case "qualified": return "Qualified";
    case "pitched": return "Pitched";
    case "follow_up": return "Follow Up";
    case "no_interest": return "No Interest";
  }
}

function formatTranscriptForGemini(transcript: TranscriptEntry[]): string {
  return transcript
    .map((t) => `${t.role === "user" ? "Buyer" : "Maya"}: ${t.content}`)
    .join("\n");
}

function parseSummaryJson(text: string): Summary {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("summary_json_missing_object");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(withoutFence.slice(start, end + 1));
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    throw new Error(`summary_json_parse_failed: ${message}`);
  }

  const parsed = SummarySchema.safeParse(parsedJson);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(`summary_schema_failed: ${issue.path.join(".") || "root"} ${issue.message}`);
  }
  return parsed.data;
}

export async function summarizeLead(channel: string, transcript: TranscriptEntry[]): Promise<LeadRecord> {
  const ai = new GoogleGenerativeAI(env.geminiApiKey);
  const model = ai.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 1200,
    },
  });

  const catalogList = franchiseCatalog
    .map((b) => `- ${b.brandId} | ${b.brandName} | ${b.category} | PHP ${b.capitalMin}-${b.capitalMax}`)
    .join("\n");

  const prompt = `Extract a structured franchise lead summary from this voice sales transcript.
Return ONLY JSON with the following shape (no markdown, no commentary).

CATALOG (id | brand_name | category | capital range):
${catalogList}

REQUIRED JSON SHAPE:
{
  "investor_name": string,
  "email": string,
  "phone": string,
  "customer_type": "ofw" | "local",
  "customer_label": string,
  "budget_text": string,
  "budget_value": number,
  "preferred_industry": string,
  "target_location": string,
  "management_style": "hands_on" | "family_managed" | "semi_passive",
  "timeline": string,
  "recommended_brand_id": string,
  "recommended_brand_name": string,
  "recommendation_reason": string,
  "market_signal": string,
  "risk_flags": string[],
  "objections_raised": string[],
  "conversation_summary": string,
  "next_action": "book_consultation" | "send_brochure" | "follow_up_call" | "no_interest",
  "stage": "qualified" | "pitched" | "closed" | "follow_up" | "no_interest" | "in_consultation" | "hot_lead" | "new_lead" | "high_intent"
}

TRANSCRIPT:
${formatTranscriptForGemini(transcript)}
`;

  const result = await model.generateContent(prompt);
  const summary = parseSummaryJson(result.response.text());

  const brand = franchiseCatalog.find((b) => b.brandId === summary.recommended_brand_id) ??
    franchiseCatalog.find((b) => b.brandName === summary.recommended_brand_name);

  const aiScore = computeFitScore(summary, brand);

  const lead: LeadRecord = {
    leadId: `lead-${channel}-${Date.now()}`,
    investorName: summary.investor_name,
    email: summary.email,
    phone: summary.phone,
    customerType: summary.customer_type as CustomerType,
    customerLabel: summary.customer_label || (summary.customer_type === "ofw" ? "OFW" : "Local"),
    budgetText: summary.budget_text,
    budgetValue: summary.budget_value,
    preferredIndustry: summary.preferred_industry,
    targetLocation: summary.target_location,
    aiScore,
    scoreLabel:
      aiScore >= 80 ? "High Match" :
      aiScore >= 60 ? "Good Match" :
      "Needs Review",
    stage: summary.stage as DealStage,
    lastActivity: "just now",
    channel: "Voice AI Call",
    actionLabel: summary.next_action === "book_consultation" ? "Book Consultation" : "Open Transcript",
    recommendedBrand: brand?.brandName ?? summary.recommended_brand_name,
    recommendationReason: summary.recommendation_reason,
    marketSignal: summary.market_signal,
    managementStyle: summary.management_style as ManagementStyle,
    timeline: summary.timeline,
    riskFlags: summary.risk_flags,
    transcriptPreview: transcript
      .slice(-6)
      .map((t) => `${t.role === "user" ? "Buyer" : "Maya"}: ${t.content}`),
  };

  // For UX: a synthetic label that mirrors the figma chips
  lead.customerLabel = lead.customerType === "ofw" ? `OFW (${lead.targetLocation || "Abroad"})` : stageToLabel(lead.stage);

  return lead;
}

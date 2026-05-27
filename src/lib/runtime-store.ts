import type { LeadRecord } from "@/lib/types";
import { leadRecords as seedLeads } from "@/lib/mock-data";

interface ChannelSession {
  agentId: string;
  channel: string;
  remoteUid: string;
  startedAt: number;
}

interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface InsightsState {
  transcript: TranscriptEntry[];
  lastAssistantTokenAt: number | null;
  lastUserSourceContent: string | null;
  channel: string;
}

interface RuntimeStore {
  channels: Map<string, ChannelSession>;
  insights: Map<string, InsightsState>;
  leads: Map<string, LeadRecord>;
  recentLeadIds: string[];
}

declare global {
  var __kaAsensoRuntime: RuntimeStore | undefined;
}

function createStore(): RuntimeStore {
  const leads = new Map<string, LeadRecord>();
  for (const lead of seedLeads) {
    leads.set(lead.leadId, lead);
  }
  return {
    channels: new Map(),
    insights: new Map(),
    leads,
    recentLeadIds: seedLeads.map((lead) => lead.leadId),
  };
}

export const runtime: RuntimeStore =
  globalThis.__kaAsensoRuntime ?? (globalThis.__kaAsensoRuntime = createStore());

export function registerChannel(channel: string, session: ChannelSession) {
  runtime.channels.set(channel, session);
  if (!runtime.insights.has(channel)) {
    runtime.insights.set(channel, {
      transcript: [],
      lastAssistantTokenAt: null,
      lastUserSourceContent: null,
      channel,
    });
  }
}

export function getChannelSession(channel: string): ChannelSession | undefined {
  return runtime.channels.get(channel);
}

export function clearChannel(channel: string) {
  runtime.channels.delete(channel);
}

export function getInsights(channel: string): InsightsState {
  let entry = runtime.insights.get(channel);
  if (!entry) {
    entry = { transcript: [], lastAssistantTokenAt: null, lastUserSourceContent: null, channel };
    runtime.insights.set(channel, entry);
  }
  return entry;
}

export function appendUserUtterance(channel: string, content: string) {
  const insights = getInsights(channel);
  const normalizedSource = content.replace(/\s+/g, " ").trim();
  if (!normalizedSource) return;

  const previousSource = insights.lastUserSourceContent ?? "";
  insights.lastUserSourceContent = normalizedSource;

  let normalized = normalizedSource;
  if (previousSource && normalizedSource.toLowerCase() === previousSource.toLowerCase()) {
    return;
  }
  if (previousSource && normalizedSource.toLowerCase().startsWith(previousSource.toLowerCase())) {
    normalized = normalizedSource.slice(previousSource.length).replace(/^[\s.,!?;:-]+/, "").trim();
    if (!normalized) return;
  }

  const lastUser = [...insights.transcript].reverse().find((entry) => entry.role === "user");
  const lastUserContent = lastUser?.content.replace(/\s+/g, " ").trim();
  if (lastUserContent && lastUserContent.toLowerCase() === normalized.toLowerCase()) {
    return;
  }

  insights.transcript.push({ role: "user", content: normalized, ts: Date.now() });
}

export function appendAssistantToken(channel: string, token: string) {
  const insights = getInsights(channel);
  const last = insights.transcript[insights.transcript.length - 1];
  if (last && last.role === "assistant" && insights.lastAssistantTokenAt &&
      Date.now() - insights.lastAssistantTokenAt < 4000) {
    last.content += token;
  } else {
    insights.transcript.push({ role: "assistant", content: token, ts: Date.now() });
  }
  insights.lastAssistantTokenAt = Date.now();
}

export function appendAssistantMessage(channel: string, content: string) {
  const insights = getInsights(channel);
  insights.transcript.push({ role: "assistant", content, ts: Date.now() });
  insights.lastAssistantTokenAt = Date.now();
}

export function listLeads(): LeadRecord[] {
  return runtime.recentLeadIds
    .map((id) => runtime.leads.get(id))
    .filter((lead): lead is LeadRecord => Boolean(lead));
}

export function getLead(id: string): LeadRecord | undefined {
  return runtime.leads.get(id);
}

export function upsertLead(lead: LeadRecord) {
  const existing = runtime.leads.has(lead.leadId);
  runtime.leads.set(lead.leadId, lead);
  if (!existing) {
    runtime.recentLeadIds.unshift(lead.leadId);
  } else {
    runtime.recentLeadIds = [lead.leadId, ...runtime.recentLeadIds.filter((id) => id !== lead.leadId)];
  }
}

export type { ChannelSession, TranscriptEntry, InsightsState };

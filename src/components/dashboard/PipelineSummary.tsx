"use client";

import { useEffect, useMemo, useState } from "react";
import type { LeadRecord } from "@/lib/types";

interface Bucket {
  key: string;
  label: string;
  count: number;
  tone: "navy" | "gold" | "leaf" | "slate";
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₱${Math.round(value / 1_000)}K`;
  return `₱${value}`;
}

export default function PipelineSummary() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/leads", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { leads: LeadRecord[] };
        if (active) setLeads(json.leads);
      } catch {
        // ignore
      }
    }
    load();
    const id = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const summary = useMemo(() => {
    const total = leads.length;
    const highIntent = leads.filter((l) => l.aiScore >= 80).length;
    const ofw = leads.filter((l) => l.customerType === "ofw").length;
    const pipelineValue = leads.reduce((acc, l) => acc + (l.budgetValue || 0), 0);
    const avgScore = total ? Math.round(leads.reduce((acc, l) => acc + l.aiScore, 0) / total) : 0;

    const stageCounts = new Map<string, number>();
    for (const lead of leads) {
      stageCounts.set(lead.stage, (stageCounts.get(lead.stage) ?? 0) + 1);
    }
    const stageBuckets: Bucket[] = [
      { key: "new_lead", label: "New", count: stageCounts.get("new_lead") ?? 0, tone: "slate" },
      { key: "in_consultation", label: "In consultation", count: stageCounts.get("in_consultation") ?? 0, tone: "navy" },
      { key: "high_intent", label: "High intent", count: stageCounts.get("high_intent") ?? 0, tone: "gold" },
      { key: "hot_lead", label: "Hot", count: stageCounts.get("hot_lead") ?? 0, tone: "leaf" },
    ];
    const maxStage = Math.max(1, ...stageBuckets.map((b) => b.count));

    return { total, highIntent, ofw, pipelineValue, avgScore, stageBuckets, maxStage };
  }, [leads]);

  return (
    <section className="pipeline-summary" aria-label="Pipeline summary">
      <article className="pipeline-card pipeline-card-hero">
        <header>
          <p className="pipeline-eyebrow">Active pipeline value</p>
          <h2>{formatCurrency(summary.pipelineValue)}</h2>
          <p className="pipeline-foot">
            Across <strong>{summary.total}</strong> qualified buyers · avg AI score{" "}
            <strong>{summary.avgScore}</strong>
          </p>
        </header>
        <svg viewBox="0 0 220 80" className="pipeline-spark" aria-hidden="true">
          <defs>
            <linearGradient id="pipeline-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--raw-gold-500)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--raw-gold-500)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 60 L20 52 L40 56 L60 40 L80 46 L100 28 L120 36 L140 22 L160 30 L180 12 L200 18 L220 8 L220 80 L0 80 Z"
            fill="url(#pipeline-spark-fill)"
          />
          <path
            d="M0 60 L20 52 L40 56 L60 40 L80 46 L100 28 L120 36 L140 22 L160 30 L180 12 L200 18 L220 8"
            fill="none"
            stroke="var(--raw-gold-500)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </article>

      <article className="pipeline-card">
        <p className="pipeline-eyebrow">High intent buyers</p>
        <div className="pipeline-row">
          <span className="pipeline-big">{summary.highIntent}</span>
          <span className="pipeline-trend up">Score ≥ 80</span>
        </div>
        <p className="pipeline-foot">{summary.ofw} OFW · {summary.total - summary.ofw} local</p>
      </article>

      <article className="pipeline-card pipeline-card-stages">
        <header className="pipeline-stage-head">
          <p className="pipeline-eyebrow">Stage distribution</p>
          <span className="pipeline-stage-meta">live</span>
        </header>
        <ul className="pipeline-stages">
          {summary.stageBuckets.map((bucket) => {
            const pct = Math.round((bucket.count / summary.maxStage) * 100);
            return (
              <li key={bucket.key} className={`pipeline-stage tone-${bucket.tone}`}>
                <div className="pipeline-stage-row">
                  <span>{bucket.label}</span>
                  <strong>{bucket.count}</strong>
                </div>
                <div className="pipeline-stage-track" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}

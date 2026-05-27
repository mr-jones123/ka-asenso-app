"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LeadRecord } from "@/lib/types";

interface InsightItem {
  leadId: string;
  investor: string;
  brand: string;
  score: number;
  region: string;
  excerpt: string;
  tone: "match" | "risk" | "signal";
  toneLabel: string;
}

function buildInsights(leads: LeadRecord[]): InsightItem[] {
  const items: InsightItem[] = [];
  for (const lead of leads) {
    if (lead.recommendationReason) {
      items.push({
        leadId: lead.leadId,
        investor: lead.investorName,
        brand: lead.recommendedBrand,
        score: lead.aiScore,
        region: lead.targetLocation,
        excerpt: lead.recommendationReason,
        tone: "match",
        toneLabel: "Match rationale",
      });
    }
    if (lead.marketSignal) {
      items.push({
        leadId: `${lead.leadId}-signal`,
        investor: lead.investorName,
        brand: lead.recommendedBrand,
        score: lead.aiScore,
        region: lead.targetLocation,
        excerpt: lead.marketSignal,
        tone: "signal",
        toneLabel: "Market signal",
      });
    }
    if (lead.riskFlags?.length) {
      items.push({
        leadId: `${lead.leadId}-risk`,
        investor: lead.investorName,
        brand: lead.recommendedBrand,
        score: lead.aiScore,
        region: lead.targetLocation,
        excerpt: lead.riskFlags.join(" · "),
        tone: "risk",
        toneLabel: "Risk flag",
      });
    }
  }
  return items.slice(0, 8);
}

export default function LiveInsightsStream() {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/leads", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { leads: LeadRecord[] };
        if (active) {
          setInsights(buildInsights(json.leads));
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    }
    load();
    const id = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <section className="panel-card insights-panel" aria-labelledby="insights-heading">
      <header className="panel-head">
        <div>
          <h2 id="insights-heading">Live Voice Insights</h2>
          <p className="panel-subtitle">
            Ara’s reasoning, market signals, and risk flags pulled from every transcript.
          </p>
        </div>
        <Link href="/leads" className="subtle-link">
          Open full leads
        </Link>
      </header>

      {loading ? (
        <ul className="insights-list" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="insight-row insight-skeleton">
              <span className="insight-skeleton-bar" />
              <span className="insight-skeleton-bar narrow" />
            </li>
          ))}
        </ul>
      ) : insights.length === 0 ? (
        <div className="insights-empty">
          <strong>No transcripts yet.</strong>
          <p>Run a voice session from <code>/call</code> and Ara’s reasoning will stream in here.</p>
        </div>
      ) : (
        <ul className="insights-list">
          {insights.map((insight) => (
            <li key={insight.leadId} className={`insight-row tone-${insight.tone}`}>
              <div className="insight-meta">
                <span className={`insight-tag tone-${insight.tone}`}>{insight.toneLabel}</span>
                <span className="insight-score" aria-label={`AI score ${insight.score}`}>
                  {insight.score}
                </span>
              </div>
              <p className="insight-quote">“{insight.excerpt}”</p>
              <div className="insight-foot">
                <span className="insight-investor">{insight.investor}</span>
                <span className="insight-divider" />
                <span>{insight.brand}</span>
                <span className="insight-divider" />
                <span>{insight.region}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

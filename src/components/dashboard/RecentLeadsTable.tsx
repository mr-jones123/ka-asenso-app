"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/shared/StatusPill";
import type { LeadRecord } from "@/lib/types";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export default function RecentLeadsTable() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/leads", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { leads: LeadRecord[] };
        if (active) setLeads(json.leads.slice(0, 3));
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

  return (
    <section className="panel-card" aria-labelledby="recent-leads-heading">
      <header className="panel-head">
        <h2 id="recent-leads-heading">Recent Franchisor Leads</h2>
        <Link href="/leads" className="subtle-link">
          View All Leads
        </Link>
      </header>

      <div className="table-wrap">
        <table className="ka-table" role="table">
          <thead>
            <tr>
              <th>Investor Name</th>
              <th>Status</th>
              <th>Target Province</th>
              <th>AI Score</th>
              <th>Consultation</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--admin-fg-soft)" }}>
                  No leads yet. Start a voice call from /call to generate one.
                </td>
              </tr>
            ) : null}
            {leads.map((lead) => (
              <tr key={lead.leadId}>
                <td>
                  <div className="investor-cell">
                    <span className="avatar-badge" aria-hidden="true">
                      {initials(lead.investorName)}
                    </span>
                    <span>{lead.investorName}</span>
                  </div>
                </td>
                <td>
                  <StatusPill
                    label={lead.customerLabel}
                    tone={lead.customerLabel.includes("OFW") ? "blue" : "slate"}
                  />
                </td>
                <td>{lead.targetLocation}</td>
                <td>
                  <div className="score-cell">
                    <span className={lead.aiScore >= 80 ? "score-good" : "score-mid"}>{lead.aiScore}</span>
                    <span className="score-track" aria-hidden="true">
                      <span style={{ width: `${lead.aiScore}%` }} />
                    </span>
                  </div>
                </td>
                <td>
                  <Link href="/leads" className="subtle-link">
                    View Transcript
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

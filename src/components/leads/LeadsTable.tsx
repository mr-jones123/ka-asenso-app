import type { DealStage, LeadRecord } from "@/lib/types";
import StatusPill from "@/components/shared/StatusPill";

interface LeadsTableProps {
  leads: LeadRecord[];
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function stageTone(stage: DealStage): "blue" | "green" | "orange" | "slate" | "navy" {
  switch (stage) {
    case "hot_lead":
      return "orange";
    case "in_consultation":
      return "blue";
    case "new_lead":
      return "slate";
    case "high_intent":
      return "green";
    case "closed":
      return "navy";
    default:
      return "slate";
  }
}

function stageLabel(stage: DealStage): string {
  switch (stage) {
    case "hot_lead":
      return "Hot Lead";
    case "in_consultation":
      return "In Consultation";
    case "new_lead":
      return "New Lead";
    case "high_intent":
      return "High Intent";
    case "closed":
      return "Closed";
    case "qualified":
      return "Qualified";
    case "pitched":
      return "Pitched";
    case "follow_up":
      return "Follow Up";
    case "no_interest":
      return "No Interest";
  }
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <section className="panel-card leads-table-card" aria-labelledby="leads-table-heading">
      <header className="panel-head leads-table-head">
        <h2 id="leads-table-heading">Franchisor Leads</h2>
        <div className="leads-table-actions">
          <button type="button" className="button button-ghost dropdown">
            <span className="sparkle-dot" aria-hidden="true" />
            AI Priority
            <span aria-hidden="true">›</span>
          </button>
          <button type="button" className="button button-ghost dropdown">
            Export CSV
          </button>
        </div>
      </header>

      <div className="table-wrap">
        <table className="ka-table leads-table" role="table">
          <thead>
            <tr>
              <th>Investor</th>
              <th>Budget</th>
              <th>Preferred Industry</th>
              <th>Target Location</th>
              <th>AI Match Score</th>
              <th>Status</th>
              <th>Last Activity</th>
              <th aria-label="Row actions" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.leadId}>
                <td>
                  <div className="investor-cell">
                    <span className="avatar-badge lg" aria-hidden="true">
                      {initials(lead.investorName)}
                    </span>
                    <div className="investor-stack">
                      <span className="investor-name">{lead.investorName}</span>
                      <span className="investor-meta">{lead.email}</span>
                      <span className="investor-meta">{lead.phone}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cell-stack">
                    <span className="cell-strong">{lead.budgetText.split(" - ")[0]}</span>
                    <span className="cell-meta">{lead.budgetText}</span>
                  </div>
                </td>
                <td>
                  <div className="industry-cell">
                    <span className="industry-icon" aria-hidden="true" />
                    <div className="cell-stack">
                      <span className="cell-strong">{lead.preferredIndustry}</span>
                      <span className="cell-meta">{lead.preferredIndustry} Services</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cell-stack">
                    <span className="cell-strong">{lead.targetLocation}</span>
                    <span className="cell-meta">{lead.customerType === "ofw" ? "Region" : "Metro"}</span>
                  </div>
                </td>
                <td>
                  <div className="score-cell">
                    <span className={lead.aiScore >= 80 ? "score-good" : "score-mid"}>{lead.aiScore}</span>
                    <span className="score-track" aria-hidden="true">
                      <span style={{ width: `${lead.aiScore}%` }} />
                    </span>
                    <span className="cell-meta">{lead.scoreLabel}</span>
                  </div>
                </td>
                <td>
                  <StatusPill label={stageLabel(lead.stage)} tone={stageTone(lead.stage)} />
                </td>
                <td>
                  <div className="cell-stack">
                    <span className="cell-strong">{lead.lastActivity}</span>
                    <span className="cell-meta">{lead.channel}</span>
                  </div>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="button button-outline">
                      {lead.actionLabel}
                    </button>
                    <button type="button" className="icon-button" aria-label="More options">
                      ⋮
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="leads-table-foot">
        <span className="cell-meta">Showing 1 to {leads.length} of 2,184 results</span>
        <nav className="pagination" aria-label="Lead pagination">
          <button type="button" className="page-btn" aria-label="Previous page">
            ‹
          </button>
          <button type="button" className="page-btn is-active" aria-current="page">
            1
          </button>
          <button type="button" className="page-btn">2</button>
          <button type="button" className="page-btn">3</button>
          <span className="page-divider" aria-hidden="true">…</span>
          <button type="button" className="page-btn">437</button>
          <button type="button" className="page-btn" aria-label="Next page">›</button>
          <span className="page-size">5 / page</span>
        </nav>
      </footer>
    </section>
  );
}

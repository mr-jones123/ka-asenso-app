/**
 * Static dashboard preview rendered as inline SVG-ish HTML.
 * Shows lead row, geo card, and score chart so the landing actually communicates
 * what the franchisor view looks like.
 */

const PREVIEW_LEADS = [
  { name: "Reinier Bagaybagayan", region: "Pampanga", score: 94, brand: "BrewBay Coffee Kiosk" },
  { name: "Marigold Adoracion", region: "Cebu City", score: 88, brand: "LabaGo Laundry Hub" },
  { name: "Eustaquio Villarama", region: "Davao City", score: 82, brand: "KargaBites Siomai Cart" },
];

const BARS = [
  { label: "Food Cart", value: 42 },
  { label: "Coffee Kiosk", value: 31 },
  { label: "Laundry", value: 18 },
  { label: "Pharmacy", value: 9 },
];

export default function DashboardPreview() {
  return (
    <section className="dash-preview" aria-labelledby="dash-preview-title">
      <header className="dash-preview-head">
        <p className="customer-eyebrow">For franchisors</p>
        <h2 id="dash-preview-title">
          Every call ends as a scored lead, not a wall of audio.
        </h2>
        <p className="dash-preview-lede">
          Buyer answers, recommended brand, AI fit score, transcript, and risk flags are stitched
          into one row. No spreadsheets, no listening back, no manual lead entry.
        </p>
      </header>

      <div className="dash-preview-frame" role="presentation">
        <div className="dash-preview-chrome">
          <span className="dash-preview-dot" />
          <span className="dash-preview-dot" />
          <span className="dash-preview-dot" />
          <span className="dash-preview-url">app.kaasenso.ph / dashboard</span>
        </div>

        <div className="dash-preview-grid">
          <article className="dash-preview-card span-2">
            <header className="dash-preview-card-head">
              <h3>Today’s pipeline</h3>
              <span className="pill tone-green">+18 leads · 24h</span>
            </header>
            <table className="dash-preview-table">
              <tbody>
                {PREVIEW_LEADS.map((lead) => (
                  <tr key={lead.name}>
                    <td>
                      <div className="dash-preview-investor">
                        <span className="dash-preview-avatar">
                          {lead.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </span>
                        <div>
                          <div className="dash-preview-name">{lead.name}</div>
                          <div className="dash-preview-sub">{lead.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="dash-preview-brand">{lead.brand}</td>
                    <td className="dash-preview-score-cell">
                      <span className="dash-preview-score">{lead.score}</span>
                      <span className="dash-preview-track">
                        <span style={{ width: `${lead.score}%` }} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="dash-preview-card">
            <header className="dash-preview-card-head">
              <h3>Category interest</h3>
              <span className="pill tone-slate">Last 30d</span>
            </header>
            <ul className="dash-preview-bars">
              {BARS.map((bar) => (
                <li key={bar.label}>
                  <div className="dash-preview-bar-head">
                    <span>{bar.label}</span>
                    <span>{bar.value}%</span>
                  </div>
                  <div className="dash-preview-bar-track">
                    <span style={{ width: `${bar.value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

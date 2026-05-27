import TopNav from "@/components/shared/TopNav";
import LeadsStatGrid from "@/components/leads/LeadsStatGrid";
import LeadsFilters from "@/components/leads/LeadsFilters";
import LeadsTableClient from "@/components/leads/LeadsTableClient";
import ScoringBanner from "@/components/leads/ScoringBanner";
import { leadRecords } from "@/lib/mock-data";

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Franchise Packages", href: "/franchise-builder" },
  { label: "Analytics", href: "/analytics" },
];

const STATS = [
  {
    label: "Total Leads",
    value: "2,184",
    subtext: "↑ 12% from last month",
    tone: "blue" as const,
    icon: "users" as const,
  },
  {
    label: "Qualified Leads",
    value: "1,042",
    subtext: "AI matched & verified",
    tone: "green" as const,
    icon: "filter" as const,
  },
  {
    label: "Active Consultations",
    value: "328",
    subtext: "Voice AI sessions ongoing",
    tone: "orange" as const,
    icon: "headset" as const,
  },
  {
    label: "Conversion Rate",
    value: "18.6%",
    subtext: "Projected franchise signups",
    tone: "violet" as const,
    icon: "trend" as const,
  },
];

export const metadata = {
  title: "Ka Asenso — Franchisor Leads",
  description: "Manage and track potential investors interested in your franchise.",
};

export default function LeadsPage() {
  return (
    <div className="admin-shell">
      <TopNav
        navItems={NAV}
        activeHref="/leads"
        ctaLabel="Back to Customer View"
        ctaHref="/"
        rightSlot={
          <div className="nav-trailing" aria-hidden="true">
            <button type="button" className="icon-button bell" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 17v-5a6 6 0 0112 0v5l1.5 2H4.5L6 17z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 21a2 2 0 004 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <span className="user-chip" aria-label="Logged in as Aurora Diaz">
              <span className="user-chip-initials">AD</span>
              <span className="user-chip-dot" />
            </span>
          </div>
        }
      />

      <main className="admin-main">
        <div className="page-shell admin-content">
          <header className="leads-page-head">
            <h1>Franchisor Leads</h1>
            <p>Manage and track potential investors interested in your franchise.</p>
          </header>

          <LeadsStatGrid stats={STATS} />

          <div className="leads-grid">
            <LeadsFilters />
            <LeadsTableClient initialLeads={leadRecords} />
          </div>

          <ScoringBanner />
        </div>
      </main>
    </div>
  );
}

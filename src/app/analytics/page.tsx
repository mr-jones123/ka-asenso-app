import TopNav from "@/components/shared/TopNav";

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Franchise Packages", href: "/franchise-builder" },
  { label: "Analytics", href: "/analytics" },
];

export const metadata = {
  title: "Ka Asenso — Analytics",
  description: "Pipeline analytics for the Ka Asenso franchise agent.",
};

export default function AnalyticsPage() {
  return (
    <div className="admin-shell">
      <TopNav navItems={NAV} activeHref="/analytics" ctaLabel="Back to Customer View" ctaHref="/" />
      <main className="admin-main">
        <div className="page-shell admin-content">
          <header className="leads-page-head">
            <h1>Analytics</h1>
            <p>Conversion funnels, regional intent, and package velocity charts land here.</p>
          </header>
          <section className="placeholder-card">
            <p className="placeholder-eyebrow">Roadmap</p>
            <h2>Wire conversion funnels next.</h2>
            <p>Plug Couchbase aggregates into chart blocks once telemetry events stabilize.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

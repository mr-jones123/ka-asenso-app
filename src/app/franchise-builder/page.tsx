import TopNav from "@/components/shared/TopNav";

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Franchise Builder", href: "/franchise-builder" },
];

export const metadata = {
  title: "Ka Asenso — Franchise Builder",
  description: "Configure franchise packages, pricing, and qualification rules.",
};

export default function FranchiseBuilderPage() {
  return (
    <div className="admin-shell">
      <TopNav navItems={NAV} activeHref="/franchise-builder" ctaLabel="Back to Customer View" ctaHref="/" />
      <main className="admin-main">
        <div className="page-shell admin-content">
          <header className="leads-page-head">
            <h1>Franchise Builder</h1>
            <p>Define brand packages, capital tiers, and qualification rules Ara uses on calls.</p>
          </header>
          <section className="placeholder-card">
            <p className="placeholder-eyebrow">Coming next</p>
            <h2>Builder workspace renders here.</h2>
            <p>
              Wire the package schema editor to <code>/api/franchise-builder</code> once the catalog API is live.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

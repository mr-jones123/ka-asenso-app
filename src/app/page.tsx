import Link from "next/link";
import TopNav from "@/components/shared/TopNav";

const NAV = [
  { label: "Discover Franchises", href: "#discover" },
];

export default function Home() {
  return (
    <div className="customer-shell">
      <TopNav
        navItems={NAV}
        activeHref="#discover"
        ctaLabel="Invest"
        ctaHref="/call"
        compactNav
      />

      <main className="customer-main">
        <section className="customer-hero" aria-labelledby="hero-title">
          <p className="customer-eyebrow">Voice AI franchise sales agent</p>
          <h1 id="hero-title" className="customer-headline">
            Find your best-fit Philippine franchise in one short voice call.
          </h1>
          <p className="customer-lede">
            Ka Asenso qualifies your budget, location, and management style, recommends one franchise that matches your profile, and routes a structured lead to the franchisor.
          </p>
          <div className="customer-actions">
            <Link href="/call" className="button button-primary">
              Talk to Ara
            </Link>
            <Link href="/dashboard" className="button button-ghost">
              Open franchisor view
            </Link>
          </div>
        </section>

        <section id="discover" className="customer-strip" aria-label="What Ara does">
          <article>
            <span className="customer-strip-num">01</span>
            <h2>Qualify</h2>
            <p>Budget, province, management style, timeline, OFW status.</p>
          </article>
          <article>
            <span className="customer-strip-num">02</span>
            <h2>Recommend</h2>
            <p>One franchise out of the catalog. Explained in plain language.</p>
          </article>
          <article>
            <span className="customer-strip-num">03</span>
            <h2>Handoff</h2>
            <p>Structured, scored lead sent to the franchisor dashboard.</p>
          </article>
        </section>
      </main>

      <footer className="customer-footer">
        <span>© 2026 Ka Asenso</span>
        <nav aria-label="Footer">
          <Link href="/call">Talk to Ara</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/leads">Leads</Link>
        </nav>
      </footer>
    </div>
  );
}

import Link from "next/link";
import TopNav from "@/components/shared/TopNav";
import HeroVisual from "@/components/landing/HeroVisual";
import HowItWorks from "@/components/landing/HowItWorks";
import PartnerLogoStrip from "@/components/landing/PartnerLogoStrip";
import DashboardPreview from "@/components/landing/DashboardPreview";

const NAV = [
  { label: "How it works", href: "#how" },
  { label: "Franchisors", href: "#franchisors" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Home() {
  return (
    <div className="customer-shell">
      <TopNav
        navItems={NAV}
        activeHref="#how"
        ctaLabel="Talk to Ara"
        ctaHref="/call"
        compactNav
      />

      <main className="customer-main">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="hero-grid" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="customer-eyebrow">
              <span className="hero-pulse" aria-hidden="true" />
              Live voice AI · Tagalog and English
            </p>
            <h1 id="hero-title" className="hero-headline">
              Find your best-fit Philippine franchise{" "}
              <span className="hero-accent">in one short voice call.</span>
            </h1>
            <p className="hero-lede">
              Ka Asenso qualifies your budget, location, and management style, recommends one
              franchise that actually matches your profile, and ships a structured lead to the
              franchisor before you even hang up.
            </p>
            <div className="customer-actions">
              <Link href="/call" className="button button-primary hero-cta">
                Talk to Ara
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path
                    d="M3 8h9m0 0L8 4m4 4L8 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link href="/dashboard" className="button button-ghost">
                See franchisor dashboard
              </Link>
            </div>

            <dl className="hero-metrics" aria-label="Outcome metrics">
              <div>
                <dt>Average call</dt>
                <dd>4m 12s</dd>
              </div>
              <div>
                <dt>Qualified rate</dt>
                <dd>72%</dd>
              </div>
              <div>
                <dt>Lead handoff</dt>
                <dd>&lt; 60s</dd>
              </div>
            </dl>
          </div>

          <HeroVisual />
        </section>

        <PartnerLogoStrip />

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <div id="how">
          <HowItWorks />
        </div>

        {/* ── DASHBOARD PREVIEW ────────────────────────────────── */}
        <div id="franchisors">
          <DashboardPreview />
        </div>

        {/* ── CTA BAND ─────────────────────────────────────────── */}
        <section className="cta-band" aria-label="Start your franchise journey">
          <div className="cta-band-inner">
            <div>
              <p className="customer-eyebrow on-dark">Ready when you are</p>
              <h2 className="cta-band-title">
                One call. One franchise. One scored lead.
              </h2>
              <p className="cta-band-lede">
                Whether you’re a returning OFW, a hands-on operator, or a franchisor sourcing
                qualified buyers, Ka Asenso runs the discovery loop for you.
              </p>
            </div>
            <div className="cta-band-actions">
              <Link href="/call" className="button button-success">
                Start a voice session
              </Link>
              <Link href="/dashboard" className="button button-ghost-dark">
                Open the dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="customer-footer">
        <span>© 2026 Ka Asenso · Voice-first franchise discovery</span>
        <nav aria-label="Footer">
          <Link href="/call">Talk to Ara</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/leads">Leads</Link>
        </nav>
      </footer>
    </div>
  );
}

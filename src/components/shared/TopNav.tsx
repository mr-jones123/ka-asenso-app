import Link from "next/link";
import KaAsensoLogo from "@/components/shared/KaAsensoLogo";

interface NavItem {
  label: string;
  href: string;
}

interface TopNavProps {
  navItems: NavItem[];
  activeHref: string;
  ctaLabel: string;
  ctaHref: string;
  rightSlot?: React.ReactNode;
  compactNav?: boolean;
}

export default function TopNav({
  navItems,
  activeHref,
  ctaLabel,
  ctaHref,
  rightSlot,
  compactNav = false,
}: TopNavProps) {
  return (
    <header className="top-nav-shell">
      <div className="page-shell top-nav-inner">
        <KaAsensoLogo />
        <nav
          className={compactNav ? "top-nav-links is-compact" : "top-nav-links"}
          aria-label="Primary navigation"
        >
          {navItems.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "top-nav-link is-active" : "top-nav-link"}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="top-nav-actions">
          <Link href={ctaHref} className="button button-primary">
            {ctaLabel}
          </Link>
          {rightSlot ?? null}
        </div>
      </div>
    </header>
  );
}

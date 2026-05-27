import type { PackageInterest } from "@/lib/types";

interface PackagePerformanceCardProps {
  packages: PackageInterest[];
}

const toneClass: Record<PackageInterest["tone"], string> = {
  navy: "bar-fill navy",
  gold: "bar-fill gold",
  slate: "bar-fill slate",
  green: "bar-fill green",
};

export default function PackagePerformanceCard({ packages }: PackagePerformanceCardProps) {
  return (
    <article className="panel-card" aria-labelledby="package-performance-heading">
      <header className="panel-head compact">
        <h3 id="package-performance-heading">Package Performance</h3>
      </header>
      <ul className="bar-list">
        {packages.map((pkg) => (
          <li key={pkg.label} className="bar-row">
            <div className="bar-row-head">
              <span className="bar-row-label">{pkg.label}</span>
              <span className="bar-row-value">{pkg.percent}% Interest</span>
            </div>
            <div className="bar-track" aria-hidden="true">
              <span className={toneClass[pkg.tone]} style={{ width: `${pkg.percent}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

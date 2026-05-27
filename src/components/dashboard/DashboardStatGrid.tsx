import type { DashboardStat } from "@/lib/types";

interface DashboardStatGridProps {
  stats: DashboardStat[];
}

function statToneClass(tone: DashboardStat["tone"]) {
  if (tone === "navy") return "stat-card stat-card-navy";
  return "stat-card";
}

export default function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  return (
    <section className="dashboard-stat-grid" aria-label="Dashboard headline stats">
      {stats.map((stat) => (
        <article key={stat.label} className={statToneClass(stat.tone)}>
          <div className="stat-card-top">
            <p className="stat-label">{stat.label}</p>
            <span className={stat.tone === "gold" ? "stat-icon tone-gold" : "stat-icon"} aria-hidden="true" />
          </div>
          <p className="stat-value">{stat.value}</p>
          <p className={stat.tone === "success" ? "stat-sub success" : "stat-sub"}>{stat.subtext}</p>
        </article>
      ))}
    </section>
  );
}

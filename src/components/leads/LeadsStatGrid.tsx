interface LeadStat {
  label: string;
  value: string;
  subtext: string;
  tone: "blue" | "green" | "orange" | "violet";
  icon: "users" | "filter" | "headset" | "trend";
}

interface LeadsStatGridProps {
  stats: LeadStat[];
}

function StatIcon({ icon }: { icon: LeadStat["icon"] }) {
  const stroke = "currentColor";
  if (icon === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3.4" stroke={stroke} strokeWidth="1.5" />
        <path d="M3.5 18.5c.7-3 3-4.7 5.5-4.7s4.8 1.7 5.5 4.7" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17" cy="9" r="2.6" stroke={stroke} strokeWidth="1.5" />
        <path d="M14 17c.8-1.9 2-3 3-3s2.2 1.1 3 3" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "filter") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "headset") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 13a8 8 0 0116 0v4a2 2 0 01-2 2h-1v-6h3" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 17v-4h3v6H6a2 2 0 01-2-2z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17l5-5 4 3 7-8" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h5v5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LeadsStatGrid({ stats }: LeadsStatGridProps) {
  return (
    <section className="leads-stat-grid" aria-label="Leads overview stats">
      {stats.map((stat) => (
        <article key={stat.label} className="lead-stat">
          <div className={`lead-stat-icon tone-${stat.tone}`}>
            <StatIcon icon={stat.icon} />
          </div>
          <div className="lead-stat-body">
            <p className="lead-stat-label">{stat.label}</p>
            <p className="lead-stat-value">{stat.value}</p>
            <p className={`lead-stat-sub tone-${stat.tone}`}>{stat.subtext}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

interface StatusPillProps {
  label: string;
  tone: "blue" | "green" | "orange" | "slate" | "navy";
}

const toneClass: Record<StatusPillProps["tone"], string> = {
  blue: "pill tone-blue",
  green: "pill tone-green",
  orange: "pill tone-orange",
  slate: "pill tone-slate",
  navy: "pill tone-navy",
};

export default function StatusPill({ label, tone }: StatusPillProps) {
  return <span className={toneClass[tone]}>{label}</span>;
}

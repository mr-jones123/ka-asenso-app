export default function ScoringBanner() {
  return (
    <section className="scoring-banner" aria-label="AI scoring methodology">
      <div className="scoring-banner-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3.5l1.6 4.4 4.7.5-3.6 3.1 1.1 4.6L12 13.7l-3.8 2.4 1.1-4.6L5.7 8.4l4.7-.5L12 3.5z"
            stroke="white"
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
      </div>
      <div className="scoring-banner-body">
        <p className="scoring-banner-title">AI-Powered Lead Scoring</p>
        <p className="scoring-banner-copy">
          Leads are scored based on budget fit, industry match, location potential, and engagement level.
        </p>
      </div>
      <button type="button" className="button button-outline-success">
        See Scoring Model
      </button>
    </section>
  );
}

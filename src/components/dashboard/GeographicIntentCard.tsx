export default function GeographicIntentCard() {
  return (
    <article className="panel-card geo-card" aria-label="Geographic intent">
      <header className="panel-head compact">
        <h3>Geographic Intent</h3>
        <span className="pill tone-slate">Top Region: NCR</span>
      </header>

      <div className="map-shell" aria-hidden="true">
        <div className="map-atmosphere" />
        <div className="map-shape one" />
        <div className="map-shape two" />
        <div className="map-shape three" />
        <div className="map-legend">
          <span className="map-tag gold">Davao City: High Activity</span>
          <span className="map-tag green">Cebu: Emerging Trend</span>
        </div>
      </div>
    </article>
  );
}

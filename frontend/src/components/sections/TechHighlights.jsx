const HIGHLIGHTS = [
  ["Web application", "React"],
  ["API", "FastAPI"],
  ["Data", "PostgreSQL"],
  ["Course focus", "Practical AI"],
];

export function TechHighlights() {
  return (
    <section className="tech-highlights" aria-label="Technology and learning focus">
      <div className="tech-highlights-intro">
        <span className="mono">BUILT WITH REAL TECHNOLOGY</span>
        <p>Engineering the platform. Teaching practical AI.</p>
      </div>
      <ul className="tech-highlights-list">
        {HIGHLIGHTS.map(([label, value]) => (
          <li key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

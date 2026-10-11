import "./LearningShowcase.css";

export function LearningShowcase() {
  return (
    <section className="learning-showcase" aria-labelledby="learning-showcase-title">
      <div className="learning-showcase-copy">
        <span className="learning-eyebrow">ILLUSTRATIVE LEARNING ENVIRONMENTS</span>
        <h2 id="learning-showcase-title">Curiosity gets practical.</h2>
        <p>
          Road to Future introduces students to useful AI workflows through demonstrations
          and guided activities. These licensed photos are illustrative stock imagery—not
          photos of Udaan students, classes, or outcomes.
        </p>
        <details className="learning-disclosure">
          <summary>See the course’s verified learning pillars</summary>
          <ul>
            <li>AI for presentations and visuals</li>
            <li>AI for developers</li>
            <li>AI for everyday life</li>
          </ul>
        </details>
      </div>
      <div className="learning-photo-grid">
        <figure className="learning-photo learning-photo-primary">
          <img
            src="/images/learning-classroom.webp"
            alt="Teen learners working on laptops in a classroom while a teacher supervises."
            loading="lazy"
            decoding="async"
            width="1800"
            height="1200"
          />
          <figcaption>Illustrative stock photo · Alena Darmel / Pexels</figcaption>
        </figure>
        <figure className="learning-photo learning-photo-secondary">
          <img
            src="/images/learning-collaboration.webp"
            alt="A group of learners sharing ideas during a video call on a laptop."
            loading="lazy"
            decoding="async"
            width="1800"
            height="1013"
          />
          <figcaption>Illustrative stock photo · Unsplash</figcaption>
        </figure>
      </div>
    </section>
  );
}

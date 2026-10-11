const SECTIONS = [
  ["hero", "Overview"],
  ["services", "Services"],
  ["work", "Work"],
  ["process", "Process"],
  ["products", "Products"],
  ["courses", "Courses"],
  ["about", "About"],
  ["contact", "Contact"],
];

export function SectionJumpNav({ activeId, onNavigate }) {
  return (
    <nav className="section-jump" aria-label="Homepage sections">
      <ul>
        {SECTIONS.map(([id, label]) => (
          <li key={id}>
            <a
              href={`/#${id}`}
              onClick={(event) => onNavigate(event, id)}
              aria-current={activeId === id ? "location" : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

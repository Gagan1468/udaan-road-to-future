import React from "react";
import { Mail, Sparkles } from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import { BorderGlow } from "../ui/BorderGlow.jsx";

const TEAM = [
  { name: "Gagan", role: "Founder / CEO", character: "GOJO SATORU", initials: "G", colors: "#4f46e5,#22d3ee", description: "Product vision, engineering and building what comes next." },
  { name: "Vaibhav Mehta", role: "Chief Marketing Officer", character: "ZENITSU AGATSUMA", initials: "VM", colors: "#f59e0b,#fde68a", description: "Brand, storytelling and helping great work reach people." },
  { name: "P. Ashwith", role: "Chief Technology Officer", character: "INOSUKE HASHIBIRA", initials: "PA", colors: "#0f766e,#a3e635", description: "Technical direction, architecture and reliable delivery." },
];

export function TeamSection() {
  return <section id="team" className="section team-section" aria-labelledby="team-title">
    <SectionHeading id="team-title" index="07" eyebrow="THE PEOPLE BEHIND THE BUILD" title="SMALL TEAM. BIG ENERGY.">Meet the people shaping Udaan TechSolutions — with anime-inspired character styling.</SectionHeading>
    <div className="team-grid">
      {TEAM.map((person) => <BorderGlow key={person.name} className="team-glow" colors={person.colors.split(",")} glowColor="190 85 70" backgroundColor="#0d1015" borderRadius={24}>
        <article className="team-card">
          <div className={`team-art team-art-${person.initials.toLowerCase()}`} style={{ "--team-colors": person.colors }} role="img" aria-label={`${person.character} inspired visual`}>
            <span className="team-art-orbit" /><span className="team-character-mark">{person.initials}</span><span className="team-character-silhouette" aria-hidden="true">✦</span><span className="team-art-label">{person.character}</span>
            <span className="team-spark"><Sparkles size={18} /></span>
          </div>
          <div className="team-card-copy"><p className="team-role">{person.role}</p><h3>{person.name}</h3><p>{person.description}</p><a href={`mailto:hello@udaan.tech?subject=${encodeURIComponent(`Connect with ${person.name}`)}`}><Mail size={15} /> Connect</a></div>
        </article>
      </BorderGlow>)}
    </div>
    <p className="team-note">Anime-inspired visual treatments are decorative placeholders, not official character portraits. Swap in approved images when you have the files.</p>
  </section>;
}

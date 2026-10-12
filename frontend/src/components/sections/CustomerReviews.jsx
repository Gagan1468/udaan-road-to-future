import React, { useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Quote, Star } from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading.jsx";
import FlexCarousel from "../ui/FlexCarousel.jsx";
import "./CustomerReviews.css";

// Names, ratings and the available written feedback are from the supplied review screenshots.
const REVIEWS = [
  { name: "Simran", rating: 5, age: "33 weeks ago", avatar: "/reviews/simran.png", text: "I'm really impressed with this platform. It combines smart AI technology with a user-friendly design, making it perfect for both beginners and professionals." },
  { name: "Game Town", rating: 5, age: "33 weeks ago", avatar: "/reviews/gametown.png", text: "Wow 😳" },
  { name: "Rita Bharati", rating: 4, age: "33 weeks ago", avatar: "/reviews/rita.png", text: "Shared a 4-star rating." },
  { name: "Tanishq Upadhyay", rating: 5, age: "33 weeks ago", avatar: "/reviews/tanishq.png", text: "Shared a 5-star rating." },
];
const CAROUSEL_ITEMS = REVIEWS.map((review) => ({ src: review.avatar, alt: `Profile image supplied with ${review.name}'s review`, title: review.name, subtitle: `${review.rating}.0 / 5 · Customer feedback` }));

export function CustomerReviews() {
  const [active, setActive] = useState(0);
  const review = REVIEWS[active];
  const select = (next) => setActive((next + REVIEWS.length) % REVIEWS.length);
  return <section className="section reviews-section" id="reviews" aria-labelledby="reviews-title">
    <div className="reviews-heading-row">
      <SectionHeading id="reviews-title" eyebrow="KIND WORDS" title="Reviews from our customers">Real feedback shared by people who have experienced our work.</SectionHeading>
      <div className="reviews-controls" aria-label="Review carousel controls">
        <button type="button" onClick={() => select(active - 1)} aria-label="Previous review"><ArrowLeft size={18} /></button>
        <button type="button" onClick={() => select(active + 1)} aria-label="Next review"><ArrowRight size={18} /></button>
      </div>
    </div>
    <FlexCarousel items={CAROUSEL_ITEMS} activeIndex={active} onChange={select} cardHeight={0.56} gap={18} fit="portrait" captions />
    <article className="reviews-feature" aria-live="polite" key={review.name}>
      <div className="reviews-feature-top"><Quote size={23} aria-hidden="true"/><span className="review-rating" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} aria-hidden="true" />)}</span></div>
      <p className="reviews-feature-copy">{review.text}</p>
      <div className="reviews-feature-foot"><div><strong>{review.name}</strong><span>Customer feedback · {review.age}</span></div><ExternalLink size={15} aria-hidden="true" /></div>
    </article>
    <p className="reviews-hint">Drag, swipe, or use the arrows to explore the reviews <span aria-hidden="true">→</span></p>
  </section>;
}

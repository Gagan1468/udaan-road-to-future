import React, { useEffect, useRef, useState } from "react";
import "./FlexCarousel.css";

/** Accessible, dependency-free FlexCarousel fallback with drag, wheel, keyboard and focus. */
export default function FlexCarousel({
  items = [], className = "", style, captions = true, autoplay = false,
  interval = 5, onChange, onSelect, focusOnClick = true, captureWheel = false,
  cardHeight = 0.48, gap = 18, fit = "portrait", activeIndex
}) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(activeIndex ?? 0);
  useEffect(() => { if (Number.isInteger(activeIndex)) setActive(Math.max(0, Math.min(items.length - 1, activeIndex))); }, [activeIndex, items.length]);
  const pointer = useRef(null);
  const select = (index) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    onChange?.(next);
    onSelect?.(items[next], next);
    const track = trackRef.current;
    const card = track?.children[next];
    if (card && focusOnClick && typeof card.scrollIntoView === "function") card.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest", inline: "center" });
  };
  useEffect(() => {
    if (!autoplay || items.length < 2) return undefined;
    const timer = window.setInterval(() => select(active + 1), Math.max(2, interval) * 1000);
    return () => window.clearInterval(timer);
  }, [autoplay, interval, active, items.length]);
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    Array.from(track.children).forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const delta = Math.abs(cardCenter - center);
      if (delta < distance) { distance = delta; nearest = index; }
    });
    if (active !== nearest) {
      setActive(nearest);
      onChange?.(nearest);
    }
  };
  const onPointerDown = (event) => { pointer.current = { x: event.clientX, left: trackRef.current?.scrollLeft || 0 }; };
  const onPointerUp = (event) => {
    if (!pointer.current || !trackRef.current) return;
    const dx = pointer.current.x - event.clientX;
    if (Math.abs(dx) > 36) {
      trackRef.current.scrollBy({ left: dx, behavior: "smooth" });
      const approx = Math.round(trackRef.current.scrollLeft / Math.max(1, trackRef.current.clientWidth * 0.55));
      setActive(Math.max(0, Math.min(items.length - 1, approx)));
    }
    pointer.current = null;
  };
  if (!items.length) return null;
  return <div className={`flex-carousel ${className}`} style={{ "--fc-gap": `${gap}px`, "--fc-height": `${Math.max(0.35, Math.min(0.8, cardHeight)) * 300}px`, ...style }}>
    <div className="flex-carousel__track" ref={trackRef} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointer.current = null; }} onScroll={handleScroll} onWheel={captureWheel ? (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); trackRef.current?.scrollBy({ left: e.deltaY, behavior: "auto" }); } } : undefined} tabIndex={0} role="list" aria-label="Carousel">
      {items.map((item, index) => <button type="button" className={`flex-carousel__item ${index === active ? "is-active" : ""}`} key={`${item.src}-${index}`} onClick={() => select(index)} onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); select(index + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); select(index - 1); } }} aria-pressed={index === active} role="listitem">
        <img src={item.src} alt={item.alt || item.title || ""} loading="lazy" draggable="false" />
        {captions && <span className="flex-carousel__caption"><strong>{item.title}</strong>{item.subtitle && <small>{item.subtitle}</small>}</span>}
      </button>)}
    </div>
    <div className="flex-carousel__dots" aria-label="Choose carousel item">{items.map((item, index) => <button type="button" key={`${item.title}-dot`} aria-label={`Show ${item.title}`} aria-current={active === index ? "true" : undefined} className={active === index ? "is-active" : ""} onClick={() => select(index)} />)}</div>
  </div>;
}

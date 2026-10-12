import React, { useEffect, useRef } from "react";

/** Lightweight click-spark canvas; decorative only and never intercepts input. */
export function ClickSpark({ children, sparkColor = "#67e8f9", sparkSize = 8, sparkRadius = 22, sparkCount = 7, duration = 420 }) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const sparks = useRef([]);
  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host); resize();
    const draw = (now) => {
      const rect = host.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      sparks.current = sparks.current.filter((spark) => {
        const t = (now - spark.start) / duration;
        if (t >= 1) return false;
        const eased = 1 - (1 - t) * (1 - t);
        const distance = eased * sparkRadius;
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(spark.x + Math.cos(spark.angle) * distance, spark.y + Math.sin(spark.angle) * distance);
        ctx.lineTo(spark.x + Math.cos(spark.angle) * (distance + sparkSize * (1 - t)), spark.y + Math.sin(spark.angle) * (distance + sparkSize * (1 - t)));
        ctx.stroke();
        return true;
      });
      ctx.globalAlpha = 1;
      if (sparks.current.length) raf = requestAnimationFrame(draw);
      else raf = 0;
    };
    const click = (event) => {
      const r = host.getBoundingClientRect();
      sparks.current.push(...Array.from({ length: sparkCount }, (_, i) => ({ x: event.clientX - r.left, y: event.clientY - r.top, angle: (Math.PI * 2 * i) / sparkCount, start: performance.now() })));
      if (!raf && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) raf = requestAnimationFrame(draw);
    };
    host.addEventListener("click", click);
    return () => { observer.disconnect(); host.removeEventListener("click", click); cancelAnimationFrame(raf); };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration]);
  return <div ref={hostRef} className="click-spark-host"><canvas ref={canvasRef} className="click-spark-canvas" aria-hidden="true" />{children}</div>;
}

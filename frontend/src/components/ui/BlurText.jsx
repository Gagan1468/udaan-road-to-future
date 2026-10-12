import React from "react";
import { motion, useReducedMotion } from "motion/react";

/** React Bits-inspired BlurText: staggered, accessible text reveal. */
export default function BlurText({
  text = "",
  className = "",
  delay = 0,
  animateBy = "words",
  duration = 0.55,
  direction = "top",
  once = true,
}) {
  const reduceMotion = useReducedMotion();
  const parts = animateBy === "characters" ? Array.from(text) : text.split(/\s+/).filter(Boolean);
  const hiddenY = direction === "bottom" ? -12 : 12;

  return (
    <span className={`blur-text ${className}`} aria-label={text}>
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          <motion.span
            key={`${part}-${index}`}
            className="blur-text-part"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, y: hiddenY, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once, amount: 0.4 }}
            transition={reduceMotion ? { duration: 0 } : { duration, delay: delay + index * 0.045, ease: [0.22, 1, 0.36, 1] }}
          >
            {part}
          </motion.span>
          {animateBy !== "characters" && index < parts.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}

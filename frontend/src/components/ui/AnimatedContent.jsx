import React, { forwardRef } from "react";
import { motion, useReducedMotion } from "motion/react";

/** React Bits-inspired in-view entrance wrapper with reduced-motion support. */
const AnimatedContent = forwardRef(function AnimatedContent(
  { as: Element = "div", children, className = "", distance = 22, duration = 0.6, delay = 0, ...props },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const MotionElement = Element === "div" ? motion.div : motion.create(Element);
  return (
    <MotionElement
      {...props}
      ref={ref}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={reduceMotion ? { duration: 0 } : { duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionElement>
  );
});

export default AnimatedContent;

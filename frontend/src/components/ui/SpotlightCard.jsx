import React, { forwardRef, useCallback } from "react";

/** React Bits-inspired spotlight surface; no canvas or external dependency required. */
const SpotlightCard = forwardRef(function SpotlightCard(
  { as: Element = "div", className = "", children, spotlightColor = "rgba(82, 211, 235, 0.13)", ...props },
  ref,
) {
  const handlePointerMove = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }, []);

  return (
    <Element
      {...props}
      ref={ref}
      className={`spotlight-card ${className}`.trim()}
      style={{ "--spotlight-color": spotlightColor, ...props.style }}
      onPointerMove={(event) => {
        handlePointerMove(event);
        props.onPointerMove?.(event);
      }}
    >
      {children}
    </Element>
  );
});

export default SpotlightCard;

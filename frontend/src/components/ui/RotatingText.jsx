import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import "./RotatingText.css";

function getCharacters(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return Array.from(text);
}

const RotatingText = forwardRef(function RotatingText(
  {
    texts = [],
    transition = { type: "spring", damping: 30, stiffness: 400 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    animatePresenceMode = "wait",
    animatePresenceInitial = false,
    rotationInterval = 2400,
    staggerDuration = 0.018,
    staggerFrom = "last",
    loop = true,
    auto = true,
    splitBy = "characters",
    onNext,
    mainClassName = "",
    splitLevelClassName = "",
    elementLevelClassName = "",
    ...rest
  },
  ref,
) {
  const safeTexts = texts.length ? texts : [""];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const handleIndexChange = useCallback((nextIndex) => {
    setCurrentTextIndex(nextIndex);
  }, []);

  useEffect(() => {
    onNext?.(currentTextIndex);
  }, [currentTextIndex, onNext]);

  const next = useCallback(() => {
    setCurrentTextIndex((current) => {
      const nextIndex = current === safeTexts.length - 1
        ? (loop ? 0 : current)
        : current + 1;
      return nextIndex;
    });
  }, [safeTexts.length, loop]);

  const previous = useCallback(() => {
    setCurrentTextIndex((current) => {
      const nextIndex = current === 0
        ? (loop ? safeTexts.length - 1 : current)
        : current - 1;
      return nextIndex;
    });
  }, [safeTexts.length, loop]);

  const jumpTo = useCallback((index) => {
    const valid = Math.max(0, Math.min(index, safeTexts.length - 1));
    handleIndexChange(valid);
  }, [safeTexts.length, handleIndexChange]);

  const reset = useCallback(() => handleIndexChange(0), [handleIndexChange]);

  useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

  useEffect(() => {
    if (!auto || safeTexts.length < 2) return undefined;
    const timer = window.setInterval(next, rotationInterval);
    return () => window.clearInterval(timer);
  }, [auto, next, rotationInterval, safeTexts.length]);

  const currentText = safeTexts[currentTextIndex] ?? safeTexts[0];
  const groups = useMemo(() => {
    if (splitBy === "characters") {
      return currentText.split(" ").map((word, index, words) => ({
        items: getCharacters(word),
        space: index < words.length - 1,
      }));
    }
    if (splitBy === "words") {
      return currentText.split(" ").map((word, index, words) => ({
        items: [word],
        space: index < words.length - 1,
      }));
    }
    if (splitBy === "lines") {
      return currentText.split("\n").map((line, index, lines) => ({
        items: [line],
        space: index < lines.length - 1,
      }));
    }
    return currentText.split(splitBy).map((part, index, parts) => ({
      items: [part],
      space: index < parts.length - 1,
    }));
  }, [currentText, splitBy]);

  return (
    <motion.span className={`text-rotate ${mainClassName}`} layout transition={transition} {...rest}>
      <span className="text-rotate-sr-only">{currentText}</span>
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.span
          key={currentTextIndex}
          className={`text-rotate-inner ${splitBy === "lines" ? "text-rotate-lines" : ""}`}
          layout
          aria-hidden="true"
        >
          {groups.map((group, groupIndex) => {
            const offset = groups.slice(0, groupIndex).reduce((sum, item) => sum + item.items.length, 0);
            const total = groups.reduce((sum, item) => sum + item.items.length, 0);
            return (
              <span className={`text-rotate-word ${splitLevelClassName}`} key={`${currentTextIndex}-${groupIndex}`}>
                {group.items.map((character, index) => {
                  const globalIndex = offset + index;
                  const delay = staggerFrom === "last"
                    ? (total - 1 - globalIndex) * staggerDuration
                    : staggerFrom === "center"
                      ? Math.abs(Math.floor(total / 2) - globalIndex) * staggerDuration
                      : globalIndex * staggerDuration;
                  return (
                    <motion.span
                      key={`${currentTextIndex}-${globalIndex}`}
                      className={`text-rotate-element ${elementLevelClassName}`}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{ ...transition, delay }}
                    >
                      {character}
                    </motion.span>
                  );
                })}
                {group.space && <span className="text-rotate-space"> </span>}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
});

RotatingText.displayName = "RotatingText";
export default RotatingText;

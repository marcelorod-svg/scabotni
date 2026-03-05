"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterPhraseProps {
  text: string;
  className?: string;
  wordDelayMs?: number;
  onComplete?: () => void;
}

export default function TypewriterPhrase({
  text,
  className = "",
  wordDelayMs = 80,
  onComplete,
}: TypewriterPhraseProps) {
  const words = text.split(" ");
  const [visibleCount, setVisibleCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (visibleCount >= words.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }
    const t = setTimeout(() => setVisibleCount((c) => c + 1), wordDelayMs);
    return () => clearTimeout(t);
  }, [visibleCount, words.length, wordDelayMs, onComplete]);

  const visibleText = words.slice(0, visibleCount).join(" ");

  return (
    <blockquote className={`${className} min-h-[1.5em]`}>
      <span className="text-slate-200">&ldquo;{visibleText}</span>
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-sca-accent ml-0.5"
        >
          ▋
        </motion.span>
      )}
      {isComplete && <span className="text-slate-200">&rdquo;</span>}
    </blockquote>
  );
}

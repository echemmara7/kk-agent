"use client";

import React from "react";
import { m, Variants } from "framer-motion";

interface ThinkingIndicatorProps {
  phase: "active" | "idle";
}

const dotVariants: Variants = {
  idle: {
    opacity: 0.3,
    scale: 1,
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 1.5,
      ease: "easeInOut",
    },
  },
  active: {
    opacity: 1,
    scale: [1, 1.5, 1],
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 1.2,
      ease: "easeInOut",
      staggerChildren: 0.2,
    },
  },
};

const containerVariants: Variants = {
  idle: {
    transition: {
      staggerChildren: 0.3,
      staggerDirection: -1,
    },
  },
  active: {
    transition: {
      staggerChildren: 0.3,
      staggerDirection: 1,
    },
  },
};

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ phase }) => {
  return (
    <m.div
      className="flex space-x-2 justify-center items-center"
      variants={containerVariants}
      initial="idle"
      animate={phase}
      aria-label="Thinking indicator"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <m.span
          key={i}
          className="w-3 h-3 rounded-full bg-blue-600"
          variants={dotVariants}
          style={{ transformOrigin: "center" }}
        />
      ))}
    </m.div>
  );
};

export default ThinkingIndicator;

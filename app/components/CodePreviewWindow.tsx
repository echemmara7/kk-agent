"use client";

import React, { useState } from "react";
import { m, Variants, useMotionValue, useTransform } from "framer-motion";

interface CodePreviewWindowProps {
  language: string;
  code: string;
}

const containerVariants: Variants = {
  collapsed: { rotateY: 0, scale: 1, transition: { type: "spring", stiffness: 150, damping: 20 } },
  expanded: { rotateY: 15, scale: 1.05, transition: { type: "spring", stiffness: 150, damping: 20 } },
};

const CodePreviewWindow: React.FC<CodePreviewWindowProps> = ({ language, code }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateY = useMotionValue(0);
  const scale = useTransform(rotateY, [0, 15], [1, 1.05]);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <m.div
      className="bg-gray-900 text-white rounded-lg p-4 shadow-lg cursor-pointer select-none"
      style={{ rotateY, scale, transformStyle: "preserve-3d", perspective: 800 }}
      variants={containerVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
      onClick={toggleExpand}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label="Code preview window, click to expand or collapse"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleExpand();
        }
      }}
    >
      <pre className="whitespace-pre-wrap font-mono text-sm">
        <code>{code}</code>
      </pre>
      <div className="mt-2 text-xs text-gray-400 italic">{language.toUpperCase()}</div>
    </m.div>
  );
};

export default CodePreviewWindow;

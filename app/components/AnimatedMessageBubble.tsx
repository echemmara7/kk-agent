"use client";

import React from "react";
import { m, Variants } from "framer-motion";

interface AnimatedMessageBubbleProps {
  children: React.ReactNode;
  variants: Variants;
  custom: number;
  layoutRoot?: boolean;
  className?: string;
}

const AnimatedMessageBubble: React.FC<AnimatedMessageBubbleProps> = ({
  children,
  variants,
  custom,
  layoutRoot = false,
  className = "",
}) => {
  return (
    <m.li
      custom={custom}
      variants={variants}
      initial="enter"
      animate="active"
      exit="exit"
      layout={layoutRoot ? true : undefined}
      layoutRoot={layoutRoot}
      className={`[transform-style:preserve-3d] ${className}`}
    >
      {children}
    </m.li>
  );
};

export default AnimatedMessageBubble;

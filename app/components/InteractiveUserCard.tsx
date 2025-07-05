"use client";

import React from "react";
import { m, Variants, useMotionTemplate, useMotionValue } from "framer-motion";

interface InteractiveUserCardProps {
  name: string;
  avatarUrl: string;
  connections: number;
}

const cardVariants: Variants = {
  rest: { rotateY: 0, scale: 1, boxShadow: "0 0 10px rgba(0,0,0,0.1)" },
  hover: {
    rotateY: 15,
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    transition: { type: "spring", stiffness: 150, damping: 20 },
  },
};

const lineVariants: Variants = {
  rest: { pathLength: 0, opacity: 0 },
  hover: { pathLength: 1, opacity: 1, transition: { duration: 0.5 } },
};

const InteractiveUserCard: React.FC<InteractiveUserCardProps> = ({
  name,
  avatarUrl,
  connections,
}) => {
  const rotateY = useMotionValue(0);
  const boxShadow = useMotionTemplate`0 0 10px rgba(0,0,0,${rotateY.get() / 100})`;

  return (
    <m.div
      className="w-48 p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer select-none"
      style={{ rotateY, boxShadow, transformStyle: "preserve-3d", perspective: 800 }}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      tabIndex={0}
      role="button"
      aria-label={`User card for ${name}`}
    >
      <img
        src={avatarUrl}
        alt={`${name} avatar`}
        className="w-16 h-16 rounded-full mx-auto mb-4"
      />
      <h3 className="text-center text-lg font-semibold">{name}</h3>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {connections} connections
      </p>
      <svg
        className="w-full h-6 mt-4"
        viewBox="0 0 100 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <m.path
          d="M10 10 L90 10"
          stroke="#3b82f6"
          strokeWidth="2"
          variants={lineVariants}
          initial="rest"
          animate="rest"
          whileHover="hover"
        />
      </svg>
    </m.div>
  );
};

export default InteractiveUserCard;

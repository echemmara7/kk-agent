"use client";

import React, { useEffect, useRef } from "react";
import { m, useMotionValue } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  depth: number;
  blur: number;
}

interface ParticleBackgroundProps {
  density?: number;
  interactionRadius?: number;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  density = 30,
  interactionRadius = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Initialize particles with 3 depth layers
    particles.current = Array.from({ length: density }).map(() => {
      const depth = Math.random() * 3 + 1; // 1 to 4 depth layers
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3 / depth,
        speedY: (Math.random() - 0.5) * 0.3 / depth,
        depth,
        blur: depth * 1.5,
      };
    });

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      particles.current.forEach((p) => {
        // Apply parallax offset based on mouse position and depth
        const offsetX = (mouseX.get() / 100) * p.depth;
        const offsetY = (mouseY.get() / 100) * p.depth;

        p.x += p.speedX + offsetX;
        p.y += p.speedY + offsetY;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        ctx.filter = `blur(${p.blur}px)`;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 / p.depth})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.filter = "none";
    }

    function animate() {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, mouseX, mouseY]);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      mouseX.set(event.clientX - window.innerWidth / 2);
      mouseY.set(event.clientY - window.innerHeight / 2);
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <m.div
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: "none" }}
    >
      <canvas ref={canvasRef} />
    </m.div>
  );
};

export default ParticleBackground;

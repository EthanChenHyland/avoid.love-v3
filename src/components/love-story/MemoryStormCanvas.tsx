"use client";

import { useEffect, useRef } from "react";

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  depth: number;
  phase: number;
  red: boolean;
};

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.173 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

export default function MemoryStormCanvas({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const petalCount = reduced ? (mobile ? 24 : 36) : mobile ? 72 : 150;
    const petals: Petal[] = Array.from({ length: petalCount }, (_, index) => ({
      x: seeded(index, 1),
      y: seeded(index, 2),
      vx: (seeded(index, 3) - 0.5) * 0.00065,
      vy: 0.00018 + seeded(index, 4) * 0.00062,
      size: 5 + seeded(index, 5) * (mobile ? 10 : 18),
      rotation: seeded(index, 6) * Math.PI * 2,
      spin: (seeded(index, 7) - 0.5) * 0.018,
      depth: 0.25 + seeded(index, 8) * 0.95,
      phase: seeded(index, 9) * Math.PI * 2,
      red: seeded(index, 10) > 0.72,
    }));

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let active = reduced;
    let last = performance.now();
    const pointer = { x: 0.5, y: 0.5, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawPetal = (petal: Petal, time: number) => {
      const px = petal.x * width;
      const py = petal.y * height;
      const flutter = Math.sin(time * 0.0016 + petal.phase) * petal.size * 0.32;
      const size = petal.size * petal.depth;

      context.save();
      context.translate(px + flutter, py);
      context.rotate(petal.rotation + Math.sin(time * 0.001 + petal.phase) * 0.35);
      context.scale(1, 0.58 + petal.depth * 0.22);
      context.beginPath();
      context.moveTo(0, -size);
      context.bezierCurveTo(size * 0.9, -size * 0.56, size * 0.82, size * 0.72, 0, size);
      context.bezierCurveTo(-size * 0.82, size * 0.72, -size * 0.9, -size * 0.56, 0, -size);
      context.closePath();
      context.globalAlpha = 0.3 + petal.depth * 0.55;
      context.fillStyle = petal.red ? "#8e2029" : "#dfc9aa";
      context.shadowColor = "rgba(0,0,0,.22)";
      context.shadowBlur = 7 * petal.depth;
      context.shadowOffsetY = 5 * petal.depth;
      context.fill();
      context.restore();
    };

    const render = (time: number) => {
      const delta = Math.min(36, time - last);
      last = time;
      context.clearRect(0, 0, width, height);

      petals.forEach((petal) => {
        if (!reduced) {
          const multiplier = 0.75 + Math.min(intensity, 5) * 0.08;
          petal.x += petal.vx * delta * multiplier;
          petal.y += petal.vy * delta * multiplier;
          petal.rotation += petal.spin * delta;

          if (pointer.active) {
            const dx = petal.x - pointer.x;
            const dy = petal.y - pointer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 0.18 && distance > 0.001) {
              const force = (0.18 - distance) * 0.0024 * petal.depth;
              petal.x += (dx / distance) * force * delta;
              petal.y += (dy / distance) * force * delta;
            }
          }

          if (petal.y > 1.12) petal.y = -0.12;
          if (petal.x > 1.08) petal.x = -0.08;
          if (petal.x < -0.08) petal.x = 1.08;
        }
        drawPetal(petal, time);
      });

      if (active && !reduced) raf = requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width);
      pointer.y = (event.clientY - rect.top) / Math.max(1, rect.height);
      pointer.active = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return;
        const next = entry.isIntersecting;
        if (next === active) return;
        active = next;
        if (active) {
          last = performance.now();
          raf = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "35% 0px" },
    );

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    if (reduced) render(performance.now());

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className="memory-storm" aria-hidden="true" />;
}

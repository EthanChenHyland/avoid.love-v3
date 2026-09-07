"use client";

import { useEffect, useMemo, useRef } from "react";

type DraftDebrisProps = {
  words: string[];
  restoring: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationVelocity: number;
  targetX: number;
  targetY: number;
};

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 71.17 + salt * 19.31) * 143758.5453;
  return value - Math.floor(value);
}

export default function DraftDebris({ words, restoring }: DraftDebrisProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spanRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const visibleWords = useMemo(() => words.filter(Boolean), [words]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || visibleWords.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles: Particle[] = visibleWords.map((_, index) => ({
      x: (seeded(index, 1) - 0.5) * 170,
      y: 20 + seeded(index, 2) * 72,
      vx: (seeded(index, 3) - 0.5) * 2.6,
      vy: 0.45 + seeded(index, 4) * 1.65,
      rotation: (seeded(index, 5) - 0.5) * 22,
      rotationVelocity: (seeded(index, 6) - 0.5) * 0.7,
      targetX: (index - (visibleWords.length - 1) / 2) * 54,
      targetY: 18 + (index % 2) * 22,
    }));
    const pointer = {
      x: -1000,
      y: -1000,
      speed: 0,
      lastX: 0,
      lastY: 0,
      lastTime: performance.now(),
    };
    let raf = 0;
    let visible = true;
    let active = true;

    const paint = () => {
      particles.forEach((particle, index) => {
        const span = spanRefs.current[index];
        if (!span) return;
        span.style.transform = `translate3d(${particle.x.toFixed(1)}px, ${particle.y.toFixed(1)}px, 0) rotate(${particle.rotation.toFixed(1)}deg)`;
      });
    };

    const clampParticle = (particle: Particle, width: number, height: number) => {
      const halfWidth = Math.max(34, width / 2 - 32);
      const maxY = Math.max(42, height - 34);

      if (particle.x < -halfWidth) {
        particle.x = -halfWidth;
        particle.vx = Math.abs(particle.vx) * 0.34;
      } else if (particle.x > halfWidth) {
        particle.x = halfWidth;
        particle.vx = -Math.abs(particle.vx) * 0.34;
      }

      if (particle.y < 4) {
        particle.y = 4;
        particle.vy = Math.abs(particle.vy) * 0.28;
      } else if (particle.y > maxY) {
        particle.y = maxY;
        particle.vy = -Math.abs(particle.vy) * 0.3;
      }
    };

    const placeReducedMotion = () => {
      const rect = root.getBoundingClientRect();
      particles.forEach((particle, index) => {
        const columns = Math.max(1, Math.min(4, visibleWords.length));
        const row = Math.floor(index / columns);
        const column = index % columns;
        const spread = Math.min(rect.width * 0.62, 250);
        particle.x = columns === 1 ? 0 : -spread / 2 + (spread * column) / (columns - 1);
        particle.y = 16 + row * 30;
        particle.rotation *= 0.18;
        clampParticle(particle, rect.width, rect.height);
      });
      paint();
    };

    if (reducedMotion) {
      placeReducedMotion();
      return;
    }

    const render = () => {
      if (!active || !visible) {
        raf = 0;
        return;
      }

      const rect = root.getBoundingClientRect();
      const pointerInside = pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom;
      const pointerX = pointer.x - rect.left - rect.width / 2;
      const pointerY = pointer.y - rect.top;

      particles.forEach((particle) => {
        if (restoring) {
          const safeTargetX = Math.max(-(rect.width / 2 - 32), Math.min(rect.width / 2 - 32, particle.targetX));
          const safeTargetY = Math.max(10, Math.min(rect.height - 36, particle.targetY));
          particle.vx += (safeTargetX - particle.x) * 0.055;
          particle.vy += (safeTargetY - particle.y) * 0.055;
          particle.vx *= 0.76;
          particle.vy *= 0.76;
          particle.rotation *= 0.86;
        } else {
          particle.vy += 0.024;
          particle.vx *= 0.988;
          particle.vy *= 0.992;
          particle.rotationVelocity *= 0.995;

          if (pointerInside) {
            const dx = particle.x - pointerX;
            const dy = particle.y - pointerY;
            const distance = Math.max(1, Math.hypot(dx, dy));
            if (distance < 118) {
              const force = ((118 - distance) / 118) * (0.32 + pointer.speed * 0.5);
              particle.vx += (dx / distance) * force;
              particle.vy += (dy / distance) * force;
            }
          }
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationVelocity;
        clampParticle(particle, rect.width, rect.height);
      });

      paint();
      raf = requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      const elapsed = Math.max(16, now - pointer.lastTime);
      pointer.speed = Math.min(2, Math.hypot(event.clientX - pointer.lastX, event.clientY - pointer.lastY) / elapsed);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.lastTime = now;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible && !raf) raf = requestAnimationFrame(render);
      if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }, { rootMargin: "18% 0px" });

    observer.observe(root);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [restoring, visibleWords]);

  return (
    <div ref={rootRef} className={`draft-debris ${restoring ? "is-restoring" : ""}`} aria-hidden="true">
      {visibleWords.map((word, index) => (
        <span key={`${word}-${index}`} ref={(node) => { spanRefs.current[index] = node; }}>{word}</span>
      ))}
    </div>
  );
}

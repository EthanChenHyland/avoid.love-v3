"use client";

import { useEffect, useRef } from "react";

type LivingThreadProps = {
  cut: boolean;
  scarred: boolean;
  tension: number;
};

export default function LivingThread({ cut, scarred, tension }: LivingThreadProps) {
  const glowRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const knotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const line = lineRef.current;
    if (!glow || !line) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    const pointer = { x: 500, y: 500, lastX: 500, lastY: 500, lastTime: performance.now(), speed: 0 };
    let raf = 0;
    let settleTimer = 0;

    const tension01 = Math.min(1, Math.max(0, (tension - 18) / 70));

    const draw = () => {
      const tighten = tension01 * 52;
      const knot = scarred ? 18 : 0;
      const d = [
        "M -60 830",
        `C ${185 - tighten * 0.2} ${745 + tighten * 0.35}`,
        `${215 + state.x * 0.18} ${960 + state.y * 0.12}`,
        `${425 + state.x * 0.5} ${730 + state.y * 0.48}`,
        `S ${690 + tighten + state.x * 0.18} ${395 - tighten + state.y * 0.12}`,
        `${1060 + knot} ${180 - knot * 0.25}`,
      ].join(" ");
      glow.setAttribute("d", d);
      line.setAttribute("d", d);
      if (knotRef.current) {
        knotRef.current.setAttribute("cx", (425 + state.x * 0.5).toFixed(2));
        knotRef.current.setAttribute("cy", (730 + state.y * 0.48).toFixed(2));
      }
    };

    const tick = () => {
      state.vx += (state.tx - state.x) * 0.075;
      state.vy += (state.ty - state.y) * 0.075;
      state.vx *= 0.78;
      state.vy *= 0.78;
      state.x += state.vx;
      state.y += state.vy;
      draw();

      const moving = Math.abs(state.tx - state.x) + Math.abs(state.ty - state.y) + Math.abs(state.vx) + Math.abs(state.vy) > 0.45;
      raf = moving ? requestAnimationFrame(tick) : 0;
    };

    const requestTick = () => {
      if (!reduced && !raf) raf = requestAnimationFrame(tick);
    };

    const settle = () => {
      state.tx = 0;
      state.ty = 0;
      requestTick();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduced) return;
      const now = performance.now();
      const dt = Math.max(16, now - pointer.lastTime);
      const nx = (event.clientX / Math.max(window.innerWidth, 1)) * 1000;
      const ny = (event.clientY / Math.max(window.innerHeight, 1)) * 1000;
      pointer.speed = Math.min(2.5, Math.hypot(nx - pointer.lastX, ny - pointer.lastY) / dt);
      pointer.lastX = nx;
      pointer.lastY = ny;
      pointer.lastTime = now;
      pointer.x = nx;
      pointer.y = ny;

      const influence = 0.11 + Math.min(0.12, pointer.speed * 0.045);
      state.tx = (pointer.x - 510) * influence;
      state.ty = (pointer.y - 560) * influence;
      requestTick();

      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 180);
    };

    draw();
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [scarred, tension]);

  return (
    <div className={`story-thread ${cut ? "is-cut" : ""} ${scarred ? "was-cut" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path ref={glowRef} className="story-thread__glow" pathLength="1" />
        <path ref={lineRef} className="story-thread__line" pathLength="1" />
        {scarred && <circle ref={knotRef} className="story-thread__knot" cx="425" cy="730" r="5" />}
      </svg>
    </div>
  );
}

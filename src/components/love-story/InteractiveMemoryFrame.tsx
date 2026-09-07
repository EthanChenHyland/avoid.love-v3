"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const memoryImages = [
  "/art/motif-gpt-image-1.png",
  "/art/archive-gpt-image-2.png",
  "/art/distance-gpt-image-2.png",
  "/art/unsent-gpt-image-1.png",
  "/art/reveal-gpt-image-2.png",
] as const;

const baseRotations = [-6, 3, -4, 5, -2] as const;
const baseDepths = [40, 120, -40, 85, 20] as const;

type InteractiveMemoryFrameProps = {
  index: number;
  number: string;
  title: string;
  note: string;
  moved: boolean;
  onMoved: (index: number) => void;
  onDeveloped: () => void;
};

export default function InteractiveMemoryFrame({ index, number, title, note, moved, onMoved, onDeveloped }: InteractiveMemoryFrameProps) {
  const frameRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [developed, setDeveloped] = useState(index !== 1);
  const developingRef = useRef(false);
  const dragRef = useRef({ active: false, pointerId: -1, startX: 0, startY: 0, x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0, lastTime: 0 });
  const developRef = useRef({ progress: index === 1 ? 0.08 : 1, lastX: 0, lastY: 0, complete: index !== 1 });
  const inertiaRef = useRef(0);

  const applyTransform = useCallback((tiltX = 0, tiltY = 0) => {
    const frame = frameRef.current;
    if (!frame) return;
    const drag = dragRef.current;
    frame.style.transform = `translate3d(${drag.x.toFixed(1)}px, ${drag.y.toFixed(1)}px, ${baseDepths[index]}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateZ(${baseRotations[index]}deg)`;
    frame.style.setProperty("--memory-shadow-x", `${(24 - tiltY * 1.6).toFixed(1)}px`);
    frame.style.setProperty("--memory-shadow-y", `${(31 + tiltX * 1.3).toFixed(1)}px`);
  }, [index]);

  const stopInertia = () => {
    cancelAnimationFrame(inertiaRef.current);
    inertiaRef.current = 0;
  };

  const clearPairing = () => {
    frameRef.current?.closest(".film-strip")?.querySelectorAll<HTMLElement>(".memory-frame[data-paired='true']").forEach((frame) => {
      frame.removeAttribute("data-paired");
      frame.style.removeProperty("--pair-x");
      frame.style.removeProperty("--pair-y");
    });
  };

  const overlapsProtectedCopy = () => {
    const frame = frameRef.current;
    if (!frame) return false;
    const rect = frame.getBoundingClientRect();
    return [".memories-copy", ".memories-footnote"].some((selector) => {
      const zone = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
      if (!zone) return false;
      const overlapX = Math.max(0, Math.min(rect.right, zone.right) - Math.max(rect.left, zone.left));
      const overlapY = Math.max(0, Math.min(rect.bottom, zone.bottom) - Math.max(rect.top, zone.top));
      return overlapX * overlapY > 600;
    });
  };

  const pairWithNearbyFrame = () => {
    const frame = frameRef.current;
    const strip = frame?.closest(".film-strip");
    if (!frame || !strip || overlapsProtectedCopy()) return false;
    const rect = frame.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    let nearest: { frame: HTMLElement; dx: number; dy: number; distance: number; edgeDistance: number } | null = null;
    for (const candidate of Array.from(strip.querySelectorAll<HTMLElement>(".memory-frame"))) {
      if (candidate === frame) continue;
      const other = candidate.getBoundingClientRect();
      const dx = other.left + other.width / 2 - center.x;
      const dy = other.top + other.height / 2 - center.y;
      const distance = Math.hypot(dx, dy);
      const gapX = Math.max(0, Math.abs(dx) - (rect.width + other.width) / 2);
      const gapY = Math.max(0, Math.abs(dy) - (rect.height + other.height) / 2);
      const edgeDistance = Math.hypot(gapX, gapY);
      const alignedEnough = Math.abs(dy) < Math.max(rect.height, other.height) * 0.82;
      if (edgeDistance < 96 && alignedEnough && (!nearest || edgeDistance < nearest.edgeDistance)) {
        nearest = { frame: candidate, dx, dy, distance, edgeDistance };
      }
    }
    if (!nearest) return false;
    const shiftX = Math.max(-46, Math.min(46, nearest.dx * 0.18));
    const shiftY = Math.max(-28, Math.min(28, nearest.dy * 0.14));
    frame.style.setProperty("--pair-x", `${shiftX.toFixed(1)}px`);
    frame.style.setProperty("--pair-y", `${shiftY.toFixed(1)}px`);
    nearest.frame.style.setProperty("--pair-x", `${(-shiftX).toFixed(1)}px`);
    nearest.frame.style.setProperty("--pair-y", `${(-shiftY).toFixed(1)}px`);
    frame.dataset.paired = "true";
    nearest.frame.dataset.paired = "true";
    return true;
  };

  const returnToSafeZone = () => {
    if (!overlapsProtectedCopy()) {
      pairWithNearbyFrame();
      return;
    }
    const drag = dragRef.current;
    let velocityX = 0;
    let velocityY = 0;
    const settle = () => {
      velocityX = (velocityX + (0 - drag.x) * 0.09) * 0.74;
      velocityY = (velocityY + (0 - drag.y) * 0.09) * 0.74;
      drag.x += velocityX;
      drag.y += velocityY;
      applyTransform();
      if (Math.abs(drag.x) + Math.abs(drag.y) + Math.abs(velocityX) + Math.abs(velocityY) > 0.7) inertiaRef.current = requestAnimationFrame(settle);
      else {
        drag.x = 0;
        drag.y = 0;
        applyTransform();
        inertiaRef.current = 0;
      }
    };
    inertiaRef.current = requestAnimationFrame(settle);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopInertia();
    clearPairing();
    const drag = dragRef.current;
    const image = imageRef.current;
    if (index === 1 && !developed && image?.contains(event.target as Node)) {
      const rect = image.getBoundingClientRect();
      developingRef.current = true;
      drag.pointerId = event.pointerId;
      developRef.current.lastX = event.clientX - rect.left;
      developRef.current.lastY = event.clientY - rect.top;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add("is-developing");
      return;
    }
    drag.active = true;
    drag.pointerId = event.pointerId;
    drag.startX = event.clientX - drag.x;
    drag.startY = event.clientY - drag.y;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (developingRef.current && drag.pointerId === event.pointerId) {
      advanceDevelopment(event.clientX, event.clientY, true);
      return;
    }
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const now = event.timeStamp;
    const dt = Math.max(12, now - drag.lastTime);
    const maxX = Math.max(24, Math.min((frameRef.current?.offsetWidth ?? 300) * (window.innerWidth <= 700 ? 0.20 : 0.44), window.innerWidth * (window.innerWidth <= 700 ? 0.15 : 0.22)));
    const maxY = Math.max(20, Math.min((frameRef.current?.offsetHeight ?? 360) * (window.innerWidth <= 700 ? 0.16 : 0.32), window.innerHeight * (window.innerWidth <= 700 ? 0.10 : 0.16)));
    const nextX = Math.max(-maxX, Math.min(maxX, event.clientX - drag.startX));
    const nextY = Math.max(-maxY, Math.min(maxY, event.clientY - drag.startY));
    drag.vx = (event.clientX - drag.lastX) / dt * 16;
    drag.vy = (event.clientY - drag.lastY) / dt * 16;
    drag.x = nextX;
    drag.y = nextY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    applyTransform(Math.max(-8, Math.min(8, -drag.vy * 0.45)), Math.max(-10, Math.min(10, drag.vx * 0.55)));
  };

  const release = (event: React.PointerEvent<HTMLElement>) => {
    const frame = frameRef.current;
    const drag = dragRef.current;
    if (developingRef.current && drag.pointerId === event.pointerId) {
      developingRef.current = false;
      frame?.classList.remove("is-developing");
      if (frame?.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId);
      return;
    }
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    drag.active = false;
    frame?.classList.remove("is-dragging");
    if (frame?.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId);

    if (Math.hypot(drag.x, drag.y) > 28) onMoved(index);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!overlapsProtectedCopy() && pairWithNearbyFrame()) {
      drag.vx = 0;
      drag.vy = 0;
      applyTransform();
      return;
    }

    const animateInertia = () => {
      drag.vx *= 0.91;
      drag.vy *= 0.91;
      const inertiaMaxX = Math.max(24, Math.min((frameRef.current?.offsetWidth ?? 300) * (window.innerWidth <= 700 ? 0.20 : 0.44), window.innerWidth * (window.innerWidth <= 700 ? 0.15 : 0.22)));
      const inertiaMaxY = Math.max(20, Math.min((frameRef.current?.offsetHeight ?? 360) * (window.innerWidth <= 700 ? 0.16 : 0.32), window.innerHeight * (window.innerWidth <= 700 ? 0.10 : 0.16)));
      drag.x = Math.max(-inertiaMaxX, Math.min(inertiaMaxX, drag.x + drag.vx));
      drag.y = Math.max(-inertiaMaxY, Math.min(inertiaMaxY, drag.y + drag.vy));
      const edgeX = Math.abs(drag.x) >= inertiaMaxX - 1;
      const edgeY = Math.abs(drag.y) >= inertiaMaxY - 1;
      if (edgeX) drag.vx *= -0.28;
      if (edgeY) drag.vy *= -0.28;
      applyTransform(Math.max(-5, Math.min(5, -drag.vy * 0.28)), Math.max(-7, Math.min(7, drag.vx * 0.34)));
      if (Math.abs(drag.vx) + Math.abs(drag.vy) > 0.18) inertiaRef.current = requestAnimationFrame(animateInertia);
      else {
        applyTransform();
        inertiaRef.current = 0;
        returnToSafeZone();
      }
    };
    inertiaRef.current = requestAnimationFrame(animateInertia);
  };

  const advanceDevelopment = (clientX: number, clientY: number, clampToImage = false) => {
    if (index !== 1 || developRef.current.complete) return;
    const image = imageRef.current;
    if (!image) return;
    const rect = image.getBoundingClientRect();
    if (!clampToImage && (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom)) return;
    const state = developRef.current;
    const localX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const localY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const distance = state.lastX || state.lastY ? Math.hypot(localX - state.lastX, localY - state.lastY) : 0;
    state.lastX = localX;
    state.lastY = localY;
    state.progress = Math.min(1, state.progress + distance / Math.max(600, rect.width * 3.2));
    image.style.setProperty("--develop", state.progress.toFixed(3));
    image.style.setProperty("--develop-radius", `${(14 + state.progress * 104).toFixed(1)}%`);
    image.style.setProperty("--develop-x", `${Math.max(0, Math.min(100, localX / Math.max(rect.width, 1) * 100)).toFixed(1)}%`);
    image.style.setProperty("--develop-y", `${Math.max(0, Math.min(100, localY / Math.max(rect.height, 1) * 100)).toFixed(1)}%`);
    if (state.progress >= 0.96) {
      state.complete = true;
      setDeveloped(true);
      onDeveloped();
    }
  };

  useEffect(() => {
    const restoreIfProtected = () => {
      const frame = frameRef.current;
      const drag = dragRef.current;
      if (!frame || drag.active || developingRef.current) return;
      const rect = frame.getBoundingClientRect();
      const protectedOverlap = [".memories-copy", ".memories-footnote"].some((selector) => {
        const zone = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (!zone) return false;
        const overlapX = Math.max(0, Math.min(rect.right, zone.right) - Math.max(rect.left, zone.left));
        const overlapY = Math.max(0, Math.min(rect.bottom, zone.bottom) - Math.max(rect.top, zone.top));
        return overlapX * overlapY > 600;
      });
      if (!protectedOverlap) return;
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = 0;
      drag.x = 0;
      drag.y = 0;
      drag.vx = 0;
      drag.vy = 0;
      frame.removeAttribute("data-paired");
      frame.style.removeProperty("--pair-x");
      frame.style.removeProperty("--pair-y");
      applyTransform();
    };

    const onResize = () => {
      const drag = dragRef.current;
      const maxX = Math.max(24, Math.min((frameRef.current?.offsetWidth ?? 300) * (window.innerWidth <= 700 ? 0.20 : 0.44), window.innerWidth * (window.innerWidth <= 700 ? 0.15 : 0.22)));
      const maxY = Math.max(20, Math.min((frameRef.current?.offsetHeight ?? 360) * (window.innerWidth <= 700 ? 0.16 : 0.32), window.innerHeight * (window.innerWidth <= 700 ? 0.10 : 0.16)));
      drag.x = Math.max(-maxX, Math.min(maxX, drag.x));
      drag.y = Math.max(-maxY, Math.min(maxY, drag.y));
      applyTransform();
      requestAnimationFrame(restoreIfProtected);
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", restoreIfProtected, { passive: true });
    return () => {
      cancelAnimationFrame(inertiaRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", restoreIfProtected);
    };
  }, [applyTransform]);

  return (
    <article
      ref={frameRef}
      className={`memory-frame memory-frame--${index + 1} ${moved ? "was-moved" : ""}`}
      style={{ "--memory-image": `url('${memoryImages[index]}')` } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div
        ref={imageRef}
        className={`memory-frame__image ${index === 1 ? "memory-frame__image--develop" : ""} ${developed ? "is-developed" : ""}`}
      >
        <span className="memory-frame__developed" aria-hidden="true" />
        {index === 1 && <i className="memory-frame__develop-hint" aria-hidden="true">move slowly across the photograph</i>}
      </div>
      <span className="sr-only">Memory {number}</span>
      <strong>{title}</strong>
      <p>{note}</p>
    </article>
  );
}

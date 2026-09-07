"use client";

import { useEffect, useRef } from "react";

type FoldedConfessionProps = {
  folded: boolean;
  onFolded: () => void;
};

type GestureIntent = "pending" | "folding" | "scrolling";

type GestureState = {
  active: boolean;
  pointerId: number;
  intent: GestureIntent;
  startX: number;
  startY: number;
  startProgress: number;
  progress: number;
};

export default function FoldedConfession({ folded, onFolded }: FoldedConfessionProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const settleTimerRef = useRef<number | null>(null);
  const gestureRef = useRef<GestureState>({
    active: false,
    pointerId: -1,
    intent: "pending",
    startX: 0,
    startY: 0,
    startProgress: folded ? 1 : 0,
    progress: folded ? 1 : 0,
  });

  const apply = (progress: number) => {
    const root = rootRef.current;
    if (!root) return;
    const clamped = Math.max(0, Math.min(1, progress));
    gestureRef.current.progress = clamped;
    root.style.setProperty("--fold", clamped.toFixed(3));
    root.style.setProperty("--fold-angle", `${(-176 * clamped).toFixed(2)}deg`);
    root.style.setProperty("--fold-shadow", (0.08 + clamped * 0.24).toFixed(3));
  };

  const settle = (target: 0 | 1) => {
    const root = rootRef.current;
    if (!root) return;

    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    root.classList.add("is-settling");
    apply(target);
    settleTimerRef.current = window.setTimeout(() => {
      root.classList.remove("is-settling");
      settleTimerRef.current = null;
    }, 460);

    if (target === 1 && !folded) onFolded();
  };

  useEffect(() => {
    apply(folded ? 1 : gestureRef.current.progress);
  }, [folded]);

  useEffect(() => () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (folded) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle(1);
      return;
    }

    gestureRef.current = {
      active: true,
      pointerId: event.pointerId,
      intent: "pending",
      startX: event.clientX,
      startY: event.clientY,
      startProgress: gestureRef.current.progress,
      progress: gestureRef.current.progress,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = gestureRef.current;
    if (!state.active || state.pointerId !== event.pointerId || folded) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (state.intent === "pending") {
      if (Math.max(absX, absY) < 9) return;

      if (absY > absX * 1.12) {
        state.intent = "scrolling";
        state.active = false;
        return;
      }

      if (dx >= -7 || absX < absY * 1.08) return;

      state.intent = "folding";
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      event.currentTarget.classList.add("is-folding");
    }

    if (state.intent !== "folding") return;
    const travel = Math.max(170, event.currentTarget.getBoundingClientRect().width * 0.46);
    apply(state.startProgress + (state.startX - event.clientX) / travel);
  };

  const release = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = gestureRef.current;
    if (state.pointerId !== event.pointerId) return;

    const wasFolding = state.active && state.intent === "folding";
    state.active = false;
    state.intent = "pending";
    event.currentTarget.classList.remove("is-folding");

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (wasFolding) settle(state.progress >= 0.55 ? 1 : 0);
  };

  const cancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = gestureRef.current;
    if (state.pointerId !== event.pointerId) return;
    const shouldReset = state.intent === "folding" && !folded;
    state.active = false;
    state.intent = "pending";
    event.currentTarget.classList.remove("is-folding");
    if (shouldReset) settle(0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (folded || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    settle(1);
  };

  return (
    <button
      ref={rootRef}
      type="button"
      className={`almost-note ${folded ? "is-folded" : ""}`}
      aria-label={folded ? "The confession is folded" : "Swipe left across the confession to fold it"}
      aria-pressed={folded}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={cancel}
      onKeyDown={onKeyDown}
    >
      <span className="almost-note__left">
        <i>you wrote one honest line.</i>
        <strong>I miss you.</strong>
        <em>that felt like too much.</em>
      </span>
      <span className="almost-note__right" aria-hidden="true">
        <i>so you folded it</i>
        <b />
      </span>
      <span className="almost-note__shadow" aria-hidden="true" />
    </button>
  );
}

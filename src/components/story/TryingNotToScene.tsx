"use client";

import { useEffect, useState, type RefObject } from "react";
import type { SuppressionKey } from "./types";

type TryingNotToSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
  attempts: number;
  lastAttempt: SuppressionKey | null;
  onAttempt: (key: SuppressionKey) => void;
};

const objects: Array<{ key: SuppressionKey; verb: string; title: string }> = [
  { key: "letter", verb: "close", title: "the letter" },
  { key: "photo", verb: "hide", title: "the photograph" },
  { key: "flower", verb: "throw away", title: "the flower" },
  { key: "thread", verb: "cut", title: "the thread" },
];

export default function TryingNotToScene({ sectionRef, attempts, lastAttempt, onAttempt }: TryingNotToSceneProps) {
  const [resisting, setResisting] = useState<SuppressionKey | null>(null);

  useEffect(() => {
    if (!resisting) return;
    const timer = window.setTimeout(() => setResisting(null), 900);
    return () => window.clearTimeout(timer);
  }, [resisting]);

  const tryIt = (key: SuppressionKey) => {
    setResisting(key);
    onAttempt(key);
  };

  return (
    <section ref={sectionRef} className="trying-story" aria-labelledby="trying-title">
      <header className="chapter-mark">
        <span>07</span>
        <span>TRYING NOT TO</span>
      </header>

      <div className="trying-story__copy">
        <p>this is where the domain becomes useful.</p>
        <h2 id="trying-title">Fine. Avoid it.</h2>
        <span>try anything.</span>
      </div>

      <div className="trying-table" aria-label="Things you try to get rid of">
        {objects.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`trying-object trying-object--${item.key} ${resisting === item.key ? "is-resisting" : ""}`}
            onClick={() => tryIt(item.key)}
          >
            <span>{item.verb}</span>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>

      <p className="trying-story__response" aria-live="polite">
        {attempts === 0
          ? "go on."
          : lastAttempt === "thread"
            ? "it tied itself back together."
            : lastAttempt === "flower"
              ? "you found a petal in your pocket."
              : lastAttempt === "photo"
                ? "you knew exactly where you hid it."
                : "you opened it again."}
      </p>
    </section>
  );
}

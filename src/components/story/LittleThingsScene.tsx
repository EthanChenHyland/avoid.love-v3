"use client";

import { useRef, useState, type PointerEvent, type RefObject } from "react";

type LittleThingsSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
};

const keepsakes = [
  { id: "coffee", eyebrow: "08:12", title: "oat latte", detail: "one sugar. you remembered after hearing it once." },
  { id: "song", eyebrow: "track 04", title: "that song", detail: "you added it before you got home." },
  { id: "joke", eyebrow: "00:43", title: "the bad joke", detail: "still funny the next morning." },
  { id: "ticket", eyebrow: "row g / seat 12", title: "the ticket", detail: "creased twice. never thrown away." },
  { id: "date", eyebrow: "11", title: "the date", detail: "you know which one." },
];

export default function LittleThingsScene({ sectionRef }: LittleThingsSceneProps) {
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const drag = useRef<{ id: string; pointerId: number; x: number; y: number; baseX: number; baseY: number } | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    const current = offsets[id] ?? { x: 0, y: 0 };
    drag.current = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, baseX: current.x, baseY: current.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    setOffsets((current) => ({
      ...current,
      [active.id]: {
        x: active.baseX + event.clientX - active.x,
        y: active.baseY + event.clientY - active.y,
      },
    }));
  };

  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };

  return (
    <section ref={sectionRef} className="little-things-story" aria-labelledby="little-things-title">
      <header className="chapter-mark">
        <span>02</span>
        <span>LITTLE THINGS</span>
      </header>

      <div className="little-things-story__heading">
        <p>it was never the big things.</p>
        <h2 id="little-things-title">It was all the tiny ones.</h2>
        <span>move them around. you kept all of them anyway.</span>
      </div>

      <div className="keepsake-table" aria-label="Small things you remembered">
        {keepsakes.map((item, index) => {
          const offset = offsets[item.id] ?? { x: 0, y: 0 };
          return (
            <button
              key={item.id}
              type="button"
              className={`keepsake keepsake--${index + 1}`}
              style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${[-5, 4, -2, 6, -7][index]}deg)` }}
              onPointerDown={(event) => onPointerDown(event, item.id)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span>{item.eyebrow}</span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

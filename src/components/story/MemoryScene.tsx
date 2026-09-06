import Image from "next/image";
import type { RefObject } from "react";

type MemorySceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
};

const memories = [
  ["photo", "you both looked away at the same time"],
  ["receipt", "you still have the receipt"],
  ["train", "two stops past yours"],
  ["note", "text me when you get home"],
];

export default function MemoryScene({ sectionRef }: MemorySceneProps) {
  return (
    <section ref={sectionRef} className="memory-story" aria-labelledby="memory-title">
      <div className="memory-story__sticky">
        <Image className="memory-story__image" src="/art/archive-gpt-image-2.png" alt="" fill sizes="100vw" />
        <div className="memory-story__shade" aria-hidden="true" />

        <header className="chapter-mark chapter-mark--light">
          <span>05</span>
          <span>US / MEMORY</span>
        </header>

        <div className="memory-story__copy">
          <p>then there were memories.</p>
          <h2 id="memory-title">Ordinary things became yours.</h2>
        </div>

        <div className="memory-fan" aria-label="Shared memories">
          {memories.map(([kind, copy], index) => (
            <article key={kind} className={`memory-card memory-card--${index + 1}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{kind}</strong>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

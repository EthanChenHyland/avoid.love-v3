import Image from "next/image";
import type { RefObject } from "react";

type WaitingSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
  checks: number;
  onCheck: () => void;
};

export default function WaitingScene({ sectionRef, checks, onCheck }: WaitingSceneProps) {
  const copy = checks === 0
    ? "no message yet"
    : checks === 1
      ? "still nothing."
      : checks === 2
        ? "you knew nothing had changed."
        : "you checked anyway.";

  return (
    <section ref={sectionRef} className="waiting-story" aria-labelledby="waiting-title">
      <div className="waiting-story__sticky">
        <Image className="waiting-story__image" src="/art/unsent-gpt-image-1.png" alt="" fill sizes="100vw" />
        <div className="waiting-story__rain" aria-hidden="true" />
        <div className="waiting-story__shade" aria-hidden="true" />

        <header className="chapter-mark chapter-mark--light">
          <span>03</span>
          <span>WAITING</span>
        </header>

        <div className="waiting-story__copy">
          <p>00:47</p>
          <h2 id="waiting-title">You started waiting.</h2>
          <span>for a message. for a sign. for anything.</span>
        </div>

        <button className="waiting-check" type="button" onClick={onCheck}>
          <span aria-hidden="true" />
          <strong>check</strong>
          <small aria-live="polite">{copy}</small>
        </button>
      </div>
    </section>
  );
}

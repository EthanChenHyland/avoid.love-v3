import Image from "next/image";
import type { RefObject } from "react";

type DistanceSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
  checks: number;
  onCheck: () => void;
};

export default function DistanceScene({ sectionRef, checks, onCheck }: DistanceSceneProps) {
  return (
    <section ref={sectionRef} className={`distance-story ${checks ? "distance-story--checked" : ""}`} aria-labelledby="distance-title">
      <div className="distance-story__sticky">
        <Image
          className="distance-story__image"
          src="/art/distance-gpt-image-2.png"
          alt=""
          fill
          sizes="100vw"
        />
        <div className="distance-story__shade" aria-hidden="true" />

        <header className="chapter-mark chapter-mark--light">
          <span>06</span>
          <span>DISTANCE</span>
        </header>

        <div className="distance-story__copy">
          <p>something changed.</p>
          <h2 id="distance-title">The pauses got longer.</h2>
          <span>one chair stayed empty.</span>
        </div>

        <div className="distance-checkpoint">
          <button type="button" onClick={onCheck}>
            check anyway
          </button>
          <span aria-live="polite">{checks ? `nothing new. ${checks > 1 ? "you checked again." : "you knew before you looked."}` : "last message: 08:41"}</span>
        </div>
      </div>
    </section>
  );
}

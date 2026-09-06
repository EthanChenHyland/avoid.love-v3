import Image from "next/image";
import type { RefObject } from "react";

type LoveSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
  accepted: boolean;
  onAccept: () => void;
};

export default function LoveScene({ sectionRef, accepted, onAccept }: LoveSceneProps) {
  return (
    <section ref={sectionRef} className={`love-story ${accepted ? "love-story--accepted" : ""}`} aria-labelledby="love-title">
      <Image className="love-story__image" src="/art/reveal-gpt-image-2.png" alt="" fill sizes="100vw" />
      <div className="love-story__wash" aria-hidden="true" />

      <header className="chapter-mark">
        <span>09</span>
        <span>LOVE</span>
      </header>

      <div className="love-story__copy">
        <p>you were fine.</p>
        <h2 id="love-title">Then there was them.</h2>
        <strong>So much for avoiding love.</strong>
      </div>

      <div className="love-letter">
        <div className="love-letter__flap" aria-hidden="true" />
        <div className="love-letter__page">
          <span>{accepted ? "you can stop hiding it here." : "still thinking about them?"}</span>
          <strong>{accepted ? "love wins." : "you already know."}</strong>
        </div>
        <button type="button" onClick={onAccept} disabled={accepted}>
          {accepted ? "leave it open" : "open the letter"}
        </button>
      </div>

      <footer className="love-story__footer">
        <span>avoid.love</span>
        <span>made with all the things you kept</span>
      </footer>
    </section>
  );
}

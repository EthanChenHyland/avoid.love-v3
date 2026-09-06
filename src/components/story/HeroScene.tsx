import Image from "next/image";
import type { RefObject } from "react";

type HeroSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
};

export default function HeroScene({ sectionRef }: HeroSceneProps) {
  return (
    <section ref={sectionRef} className="before-story" aria-labelledby="before-title">
      <Image
        className="before-story__image"
        src="/art/reveal-gpt-image-2.png"
        alt=""
        fill
        preload
        sizes="100vw"
      />
      <div className="before-story__wash" aria-hidden="true" />
      <div className="before-story__curtain" aria-hidden="true" />

      <header className="chapter-mark chapter-mark--light">
        <span>00</span>
        <span>BEFORE</span>
      </header>

      <div className="before-story__lockup">
        <p>you were fine before this.</p>
        <h1 id="before-title">avoid<span>.love</span></h1>
        <strong>then there was them.</strong>
      </div>

      <div className="before-story__promise">
        <span>an interactive love story</span>
        <i />
        <em>touch what you can&apos;t stop remembering</em>
      </div>

      <div className="before-story__second-place" aria-hidden="true">
        <span />
        <small>someone sat here</small>
      </div>

      <div className="before-story__scroll" aria-hidden="true">
        <span>it started small</span>
        <i />
      </div>
    </section>
  );
}

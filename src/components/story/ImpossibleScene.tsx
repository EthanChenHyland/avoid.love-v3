import Image from "next/image";
import type { RefObject } from "react";

type ImpossibleSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
  attempts: number;
};

export default function ImpossibleScene({ sectionRef, attempts }: ImpossibleSceneProps) {
  return (
    <section ref={sectionRef} className="impossible-story" aria-labelledby="impossible-title">
      <div className="impossible-story__sticky">
        <Image className="impossible-story__image" src="/art/archive-gpt-image-2.png" alt="" fill sizes="100vw" />
        <div className="impossible-story__shade" aria-hidden="true" />

        <header className="chapter-mark chapter-mark--light">
          <span>08</span>
          <span>IMPOSSIBLE</span>
        </header>

        <div className="impossible-story__copy">
          <p>nothing disappeared.</p>
          <h2 id="impossible-title">Everything came back.</h2>
          <span>{attempts ? "including every thing you tried to hide." : "even the things you never touched."}</span>
        </div>

        <div className="returning-memories" aria-hidden="true">
          <span className="returning-memory returning-memory--photo">photo</span>
          <span className="returning-memory returning-memory--flower">flower</span>
          <span className="returning-memory returning-memory--message">I keep thinking about you.</span>
          <span className="returning-memory returning-memory--receipt">receipt / 20:46</span>
          <span className="returning-memory returning-memory--date">11</span>
          <span className="returning-memory returning-memory--note">text me when you get home</span>
        </div>
      </div>
    </section>
  );
}

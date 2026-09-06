import Image from "next/image";
import type { RefObject } from "react";

type NoticeSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
};

export default function NoticeScene({ sectionRef }: NoticeSceneProps) {
  return (
    <section ref={sectionRef} className="notice-story" aria-labelledby="notice-title">
      <div className="notice-story__paper" aria-hidden="true" />
      <div className="notice-story__photo" aria-hidden="true">
        <Image src="/art/motif-gpt-image-1.png" alt="" fill sizes="(max-width: 700px) 86vw, 50vw" />
      </div>

      <header className="chapter-mark">
        <span>01</span>
        <span>NOTICE</span>
      </header>

      <div className="notice-story__copy">
        <p>you started noticing things.</p>
        <h2 id="notice-title">The room changed when they walked in.</h2>
        <strong>Not dramatically. Just enough.</strong>
      </div>

      <div className="notice-story__details" aria-hidden="true">
        <span>the way they pushed their sleeve up</span>
        <span>the same song twice</span>
        <span>your name in their handwriting</span>
      </div>
    </section>
  );
}

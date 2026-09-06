import type { RefObject } from "react";

type UnsentSceneProps = {
  sectionRef: RefObject<HTMLElement | null>;
  draft: string;
  recoveredDraft: string;
  onDraftChange: (value: string) => void;
  onErase: () => void;
  onRecover: () => void;
};

export default function UnsentScene({
  sectionRef,
  draft,
  recoveredDraft,
  onDraftChange,
  onErase,
  onRecover,
}: UnsentSceneProps) {
  return (
    <section ref={sectionRef} className={`unsent-story ${recoveredDraft && !draft ? "unsent-story--erased" : ""}`} aria-labelledby="unsent-title">
      <header className="chapter-mark chapter-mark--light">
        <span>04</span>
        <span>UNSENT</span>
      </header>

      <div className="unsent-story__heading">
        <p>you typed it.</p>
        <h2 id="unsent-title">You almost said too much.</h2>
        <span>write it. erase it. see what actually disappears.</span>
      </div>

      <div className="unsent-paper">
        <span className="unsent-paper__time">21:48</span>
        <textarea
          value={draft}
          maxLength={160}
          aria-label="Unsent message"
          onChange={(event) => onDraftChange(event.currentTarget.value)}
        />
        {recoveredDraft && !draft && <p className="unsent-paper__ghost" aria-hidden="true">{recoveredDraft}</p>}
        <footer>
          <span>{draft.length}/160</span>
          <button type="button" onClick={draft ? onErase : onRecover} disabled={!draft && !recoveredDraft}>
            {draft ? "erase it" : "bring it back"}
          </button>
        </footer>
      </div>

      <div className="unsent-story__residue" aria-live="polite">
        {recoveredDraft && !draft ? "deleting the words did not delete the thought." : "the cursor waited with you."}
      </div>
    </section>
  );
}

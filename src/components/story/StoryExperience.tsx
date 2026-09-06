"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HeroScene from "./HeroScene";
import NoticeScene from "./NoticeScene";
import LittleThingsScene from "./LittleThingsScene";
import WaitingScene from "./WaitingScene";
import UnsentScene from "./UnsentScene";
import MemoryScene from "./MemoryScene";
import DistanceScene from "./DistanceScene";
import TryingNotToScene from "./TryingNotToScene";
import ImpossibleScene from "./ImpossibleScene";
import LoveScene from "./LoveScene";
import PersistentStoryWorld from "./PersistentStoryWorld";
import type { StoryRefs, SuppressionKey } from "./types";
import useStoryMotion from "./useStoryMotion";

export default function StoryExperience() {
  const root = useRef<HTMLElement>(null);
  const before = useRef<HTMLElement>(null);
  const notice = useRef<HTMLElement>(null);
  const littleThings = useRef<HTMLElement>(null);
  const waiting = useRef<HTMLElement>(null);
  const unsent = useRef<HTMLElement>(null);
  const memory = useRef<HTMLElement>(null);
  const distance = useRef<HTMLElement>(null);
  const trying = useRef<HTMLElement>(null);
  const impossible = useRef<HTMLElement>(null);
  const love = useRef<HTMLElement>(null);

  const refs = useMemo<StoryRefs>(() => ({
    root,
    before,
    notice,
    littleThings,
    waiting,
    unsent,
    memory,
    distance,
    trying,
    impossible,
    love,
  }), []);

  const [waitingChecks, setWaitingChecks] = useState(0);
  const [draft, setDraft] = useState("I keep thinking about you.");
  const [recoveredDraft, setRecoveredDraft] = useState("");
  const [distanceChecks, setDistanceChecks] = useState(0);
  const [suppressionAttempts, setSuppressionAttempts] = useState(0);
  const [lastSuppression, setLastSuppression] = useState<SuppressionKey | null>(null);
  const [accepted, setAccepted] = useState(false);

  useStoryMotion(refs);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !finePointer) return;

    const onPointerMove = (event: PointerEvent) => {
      const node = root.current;
      if (!node) return;
      node.style.setProperty("--pointer-x", (event.clientX / window.innerWidth - 0.5).toFixed(3));
      node.style.setProperty("--pointer-y", (event.clientY / window.innerHeight - 0.5).toFixed(3));
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  const eraseDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setRecoveredDraft(text);
    setDraft("");
  };

  const recoverDraft = () => {
    if (!recoveredDraft) return;
    setDraft(recoveredDraft);
  };

  const handleSuppression = (key: SuppressionKey) => {
    setLastSuppression(key);
    setSuppressionAttempts((current) => current + 1);
  };

  return (
    <main
      ref={root}
      className={`story-experience ${accepted ? "has-accepted" : ""}`}
    >
      <PersistentStoryWorld attempts={suppressionAttempts} accepted={accepted} />
      <HeroScene sectionRef={before} />
      <NoticeScene sectionRef={notice} />
      <LittleThingsScene sectionRef={littleThings} />
      <WaitingScene sectionRef={waiting} checks={waitingChecks} onCheck={() => setWaitingChecks((count) => count + 1)} />
      <UnsentScene
        sectionRef={unsent}
        draft={draft}
        recoveredDraft={recoveredDraft}
        onDraftChange={setDraft}
        onErase={eraseDraft}
        onRecover={recoverDraft}
      />
      <MemoryScene sectionRef={memory} />
      <DistanceScene sectionRef={distance} checks={distanceChecks} onCheck={() => setDistanceChecks((count) => count + 1)} />
      <TryingNotToScene sectionRef={trying} attempts={suppressionAttempts} lastAttempt={lastSuppression} onAttempt={handleSuppression} />
      <ImpossibleScene sectionRef={impossible} attempts={suppressionAttempts} />
      <LoveScene sectionRef={love} accepted={accepted} onAccept={() => setAccepted(true)} />
    </main>
  );
}

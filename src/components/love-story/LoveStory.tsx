"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import DraftDebris from "./DraftDebris";
import FoldedConfession from "./FoldedConfession";
import InteractiveMemoryFrame from "./InteractiveMemoryFrame";
import LivingThread from "./LivingThread";
import MemoryStormCanvas from "./MemoryStormCanvas";
import useLoveMotion from "./useLoveMotion";

const littleThings = [
  ["08:12", "oat latte", "one sugar. you remembered after hearing it once."],
  ["00:43", "the bad joke", "it was still funny the next morning."],
  ["track 04", "that song", "you added it before you got home."],
  ["row g", "the ticket", "creased twice. never thrown away."],
  ["11", "the date", "you know which one."],
] as const;

const memories = [
  ["01", "the picture", "you both looked away at the same time."],
  ["02", "the receipt", "you still have it. no good reason."],
  ["03", "the train", "two stops past yours because the conversation wasn't done."],
  ["04", "the note", "text me when you get home."],
  ["05", "the ordinary day", "somehow the one you remember most."],
] as const;

const thingsToLose = [
  ["flower", "throw away", "the flower"],
  ["photo", "hide", "the photograph"],
  ["letter", "close", "the letter"],
  ["thread", "cut", "the thread"],
] as const;

type ThingKey = (typeof thingsToLose)[number][0];

function Chapter({ number, label, light = false }: { number: string; label: string; light?: boolean }) {
  return (
    <div className={`chapter ${light ? "chapter--light" : ""}`} aria-hidden="true">
      <span className="chapter__number">{number}</span>
      <span className="chapter__label">{label}</span>
    </div>
  );
}

export default function LoveStory() {
  const rootRef = useRef<HTMLElement>(null);
  useLoveMotion(rootRef);

  const [noticed, setNoticed] = useState<Set<number>>(() => new Set());
  const [kept, setKept] = useState<Set<number>>(() => new Set());
  const [waitingChecks, setWaitingChecks] = useState(0);
  const [waitingLingered, setWaitingLingered] = useState(false);
  const [almostFolded, setAlmostFolded] = useState(false);
  const [draft, setDraft] = useState("I keep thinking about you.");
  const [ghostDraft, setGhostDraft] = useState("");
  const [restoringDraft, setRestoringDraft] = useState(false);
  const [erasedEver, setErasedEver] = useState(false);
  const [movedMemories, setMovedMemories] = useState<Set<number>>(() => new Set());
  const [photoDeveloped, setPhotoDeveloped] = useState(false);
  const [distance, setDistance] = useState(36);
  const [distanceDragging, setDistanceDragging] = useState(false);
  const [distanceChecks, setDistanceChecks] = useState(0);
  const [distancePulledEver, setDistancePulledEver] = useState(false);
  const [missing, setMissing] = useState<Set<ThingKey>>(() => new Set());
  const [lostEver, setLostEver] = useState<Set<ThingKey>>(() => new Set());
  const [lastAttempt, setLastAttempt] = useState<ThingKey | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterHolding, setLetterHolding] = useState(false);
  const returnTimers = useRef<Map<ThingKey, number>>(new Map());
  const restoreTimer = useRef<number | null>(null);
  const distanceRaf = useRef<number | null>(null);
  const letterHoldTimer = useRef<number | null>(null);

  useEffect(() => {
    const timers = returnTimers.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      if (restoreTimer.current) window.clearTimeout(restoreTimer.current);
      if (letterHoldTimer.current) window.clearTimeout(letterHoldTimer.current);
      if (distanceRaf.current) cancelAnimationFrame(distanceRaf.current);
    };
  }, []);

  useEffect(() => {
    if (waitingLingered) return;
    const waiting = rootRef.current?.querySelector<HTMLElement>("#waiting .waiting-sticky");
    if (!waiting) return;

    let timer: number | null = null;
    const clearLinger = () => {
      if (timer === null) return;
      window.clearTimeout(timer);
      timer = null;
    };
    const evaluate = () => {
      if (document.visibilityState !== "visible") {
        clearLinger();
        return;
      }
      const rect = waiting.getBoundingClientRect();
      const viewportHeight = Math.max(1, window.innerHeight);
      const visible = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const ratio = visible / Math.min(Math.max(1, rect.height), viewportHeight);
      if (ratio < 0.62) {
        clearLinger();
        return;
      }
      if (timer !== null) return;
      timer = window.setTimeout(() => {
        timer = null;
        setWaitingLingered(true);
      }, 2400);
    };

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    document.addEventListener("visibilitychange", evaluate);
    return () => {
      clearLinger();
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
      document.removeEventListener("visibilitychange", evaluate);
    };
  }, [waitingLingered]);

  const waitingLine = useMemo(() => {
    if (waitingChecks === 0) return "no message yet";
    if (waitingChecks === 1) return "still nothing.";
    if (waitingChecks === 2) return "you knew nothing had changed.";
    return "you checked anyway.";
  }, [waitingChecks]);
  const ghostWords = useMemo(() => ghostDraft.trim().split(/\s+/).filter(Boolean), [ghostDraft]);
  const noticedEverything = noticed.size === 3;
  const keptEverything = kept.size === littleThings.length;
  const waitedAgain = waitingChecks >= 2 || waitingLingered;
  const checkedAcrossDistance = distanceChecks >= 2;
  const rememberedTicket = kept.has(3);
  const rememberedWaiting = waitingChecks > 0 || waitingLingered;
  const memoryStormIntensity = Math.min(
    5,
    1
      + Math.min(2, attempts)
      + (rememberedWaiting ? 1 : 0)
      + (distancePulledEver || distanceChecks > 0 ? 1 : 0),
  );
  const noticeResolution = noticedEverything
    ? "by then, you were already looking."
    : noticed.size > 0
      ? `${noticed.size} little thing${noticed.size === 1 ? "" : "s"} stayed with you.`
      : "";

  const distanceLine = distanceChecks === 0
    ? "last message · 08:41"
    : distanceChecks === 1
      ? "nothing new. you knew before you looked."
      : "nothing new. you checked again.";

  const attemptLine = !lastAttempt
    ? "go on. try it."
    : lastAttempt === "flower"
      ? "you found a petal in your pocket later."
      : lastAttempt === "photo"
        ? "you knew exactly where you hid it."
        : lastAttempt === "letter"
          ? "you opened it again."
          : "it tied itself back together.";

  const finalMemoryLine = useMemo(() => {
    const movedPhoto = movedMemories.size > 0;
    if (noticedEverything && keptEverything && erasedEver) {
      if (waitedAgain || checkedAcrossDistance) {
        return "you noticed everything. kept all five. erased the words. kept checking. all of it came back.";
      }
      return "you noticed every little thing. kept all five. even the words you erased came back.";
    }
    if (noticedEverything && keptEverything) {
      if (waitedAgain || checkedAcrossDistance) {
        return "you noticed everything. kept all five. kept checking. that was already an answer.";
      }
      return "you noticed every little thing. kept all five. that was already an answer.";
    }
    if (movedPhoto && erasedEver && almostFolded) {
      return "the picture moved. the words vanished. the confession folded. all of it still made it here.";
    }
    if (movedPhoto && erasedEver) {
      return "the picture moved. the words vanished. both still made it here.";
    }
    if (movedPhoto) return "the picture you moved still found its way back.";
    if (erasedEver) return "even the words you erased made it here.";
    if (almostFolded) return "even the words you folded away made it here.";
    if (lostEver.size > 0) return "everything you tried to lose found its way back.";
    if (waitingLingered && distancePulledEver) return "you waited past the minute. pulled the distance closer. the thread still made it here.";
    if (waitedAgain) return "you checked even after you knew. that made it here too.";
    if (distancePulledEver || checkedAcrossDistance) return "you pulled at the distance. the thread was still there.";
    if (photoDeveloped) return "you stayed long enough for the picture to appear.";
    return "you kept all of it because it mattered.";
  }, [almostFolded, checkedAcrossDistance, distancePulledEver, erasedEver, keptEverything, lostEver, movedMemories, noticedEverything, photoDeveloped, waitedAgain, waitingLingered]);

  const toggleNotice = (index: number) => {
    setNoticed((current) => {
      const next = new Set(current);
      next.add(index);
      return next;
    });
  };

  const keepThing = (index: number) => {
    setKept((current) => {
      const next = new Set(current);
      next.add(index);
      return next;
    });
  };

  const eraseDraft = () => {
    if (!draft.trim()) return;
    setGhostDraft(draft);
    setDraft("");
    setErasedEver(true);
  };

  const restoreDraft = () => {
    if (!ghostDraft || restoringDraft) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDraft(ghostDraft);
      return;
    }
    setRestoringDraft(true);
    restoreTimer.current = window.setTimeout(() => {
      setDraft(ghostDraft);
      setRestoringDraft(false);
      restoreTimer.current = null;
    }, 620);
  };

  const rememberMemoryMove = (index: number) => {
    setMovedMemories((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });
  };

  const releaseDistance = () => {
    setDistanceDragging(false);
    if (distance >= 36) return;

    const target = 36;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDistance(target);
      return;
    }

    if (distanceRaf.current) cancelAnimationFrame(distanceRaf.current);
    let position = distance;
    let velocity = 0;
    const spring = () => {
      velocity += (target - position) * 0.085;
      velocity *= 0.78;
      position += velocity;
      setDistance(Number(position.toFixed(2)));
      if (Math.abs(target - position) + Math.abs(velocity) > 0.08) {
        distanceRaf.current = requestAnimationFrame(spring);
      } else {
        setDistance(target);
        distanceRaf.current = null;
      }
    };
    distanceRaf.current = requestAnimationFrame(spring);
  };

  const tryToLose = (key: ThingKey) => {
    setAttempts((count) => count + 1);
    setLastAttempt(key);
    setLostEver((current) => {
      if (current.has(key)) return current;
      const next = new Set(current);
      next.add(key);
      return next;
    });
    setMissing((current) => new Set(current).add(key));
    const previous = returnTimers.current.get(key);
    if (previous) window.clearTimeout(previous);
    const timer = window.setTimeout(() => {
      setMissing((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
      returnTimers.current.delete(key);
    }, 1050);
    returnTimers.current.set(key, timer);
  };

  const moveLight = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
    event.currentTarget.style.setProperty("--light-x", `${x.toFixed(1)}%`);
    event.currentTarget.style.setProperty("--light-y", `${y.toFixed(1)}%`);
  };

  const clearLetterHold = () => {
    if (letterHoldTimer.current !== null) {
      window.clearTimeout(letterHoldTimer.current);
      letterHoldTimer.current = null;
    }
    setLetterHolding(false);
  };

  const openLetter = () => {
    clearLetterHold();
    setLetterOpen(true);
  };

  const beginLetterHold = () => {
    if (letterOpen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      openLetter();
      return;
    }

    clearLetterHold();
    setLetterHolding(true);
    letterHoldTimer.current = window.setTimeout(() => {
      letterHoldTimer.current = null;
      setLetterHolding(false);
      setLetterOpen(true);
    }, 620);
  };

  const finishLetterPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    clearLetterHold();
    if (event.button === 0 || event.pointerType === "touch") openLetter();
  };

  const openLetterFromKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openLetter();
  };

  return (
    <main ref={rootRef} className={`love-journey ${letterOpen ? "love-journey--open" : ""}`}>
      <div className="journey-progress" aria-hidden="true"><i /></div>
      <LivingThread cut={missing.has("thread")} scarred={lostEver.has("thread")} tension={distance} />

      <section id="fine" className="scene scene--fine" data-chapter="00">
        <div className="fine-sticky">
          <Image className="fine-image" src="/art/reveal-gpt-image-2.png" alt="" fill priority sizes="100vw" />
          <div className="fine-quiet" aria-hidden="true" />
          <div className="fine-warmth" aria-hidden="true" />
          <Chapter number="00" label="YOU WERE FINE" />

          <div className="fine-copy fine-copy--before">
            <p>before all of this</p>
            <h1>you were<br /><em>fine.</em></h1>
            <span>No waiting. No rereading. No keeping little pieces of a day.</span>
          </div>

          <div className="fine-copy fine-copy--them">
            <p>and then</p>
            <h2>there was<br /><em>them.</em></h2>
            <span>Not a disaster. Just a person.</span>
          </div>

          <div className="fine-cups" aria-hidden="true">
            <span>one cup</span><i /><span>two</span>
          </div>

          <div className="fine-brand" aria-hidden="true">
            <strong>avoid</strong><em>.love</em>
          </div>

          <div className="scroll-whisper" aria-hidden="true"><span>this is where it started</span><i /></div>
        </div>
      </section>

      <section
        id="them"
        className={`scene scene--them ${noticed.size > 0 ? "has-notices" : ""} ${noticedEverything ? "has-all-notices" : ""}`}
        data-chapter="01"
      >
        <div className="them-sticky">
          <Chapter number="01" label="THERE WAS THEM" />
          <div className="them-word" aria-hidden="true">them</div>
          <div className="them-photo" aria-hidden="true">
            <Image src="/art/motif-gpt-image-1.png" alt="" fill sizes="(max-width: 700px) 92vw, 58vw" />
            <span className="them-photo__tape them-photo__tape--one" />
            <span className="them-photo__tape them-photo__tape--two" />
          </div>
          <div className="them-flower" aria-hidden="true">
            <Image src="/art/motif-cutout.png" alt="" fill sizes="(max-width: 700px) 52vw, 28vw" />
          </div>
          <div className="them-copy">
            <p>the room did not stop.</p>
            <h2>It just felt<br />different with<br /><em>them in it.</em></h2>
            <strong>Then you started noticing.</strong>
          </div>
          <div
            className="notice-points"
            aria-label="Things you noticed"
            style={{ "--notice-progress": noticed.size / 3 } as React.CSSProperties}
          >
            {["the sleeve pushed up", "the pause before they laughed", "your name in their handwriting"].map((item, index) => (
              <button key={item} type="button" className={noticed.has(index) ? "is-noticed" : ""} onClick={() => toggleNotice(index)}>
                <i aria-hidden="true" />
                <span>{noticed.has(index) ? item : "notice"}</span>
              </button>
            ))}
            <p className="notice-resolution" aria-live="polite">{noticeResolution}</p>
          </div>
        </div>
      </section>

      <section
        id="little-things"
        className={`scene scene--little ${kept.size > 0 ? "has-keeps" : ""} ${keptEverything ? "has-all-keeps" : ""}`}
        data-chapter="02"
      >
        <div className="little-sticky">
          <Chapter number="02" label="THE LITTLE THINGS" />
          <div className="little-heading">
            <p>it was never the big things.</p>
            <h2>It was all the<br /><em>tiny ones.</em></h2>
            <span>tap the things you somehow kept.</span>
          </div>
          <div className="keepsakes" aria-label="Little things you remembered">
            {littleThings.map(([eyebrow, title, note], index) => (
              <button
                type="button"
                key={title}
                className={`keepsake keepsake--${index + 1} ${kept.has(index) ? "is-kept" : ""}`}
                onClick={() => keepThing(index)}
                onPointerMove={moveLight}
              >
                <span>{eyebrow}</span>
                <strong>{title}</strong>
                <small>{note}</small>
                <i aria-hidden="true">{kept.has(index) ? "kept" : "+ keep"}</i>
              </button>
            ))}
          </div>
          <div className="pocket" aria-live="polite">
            <span>{kept.size}/5</span>
            <strong>{kept.size === 0 ? "nothing kept yet" : kept.size === 5 ? "you kept everything." : "somehow worth keeping"}</strong>
          </div>
        </div>
      </section>

      <section id="waiting" className={`scene scene--waiting waiting-checks--${Math.min(waitingChecks, 3)} ${waitingLingered ? "has-lingered" : ""}`} data-chapter="03">
        <div className="waiting-sticky">
          <Image className="waiting-image" src="/art/unsent-gpt-image-1.png" alt="" fill sizes="100vw" />
          <div className="waiting-night" aria-hidden="true" />
          <div className="waiting-rain" aria-hidden="true" />
          <div className="waiting-clock" aria-hidden="true"><span>00:47</span><i>00:48</i></div>
          <div className="waiting-echoes" aria-hidden="true">
            <span>still?</span><span>still.</span><span>still.</span>
          </div>
          <Chapter number="03" label="WAITING" light />
          <div className="waiting-copy">
            <p>after midnight</p>
            <h2>You started<br /><em>waiting.</em></h2>
            <span>for a message. for a sign. for anything.</span>
          </div>
          <button type="button" className="phone-check" onClick={() => setWaitingChecks((count) => count + 1)}>
            <span className="phone-check__glass" aria-hidden="true"><i /></span>
            <span className="phone-check__label">check</span>
            <small aria-live="polite">{waitingLine}</small>
          </button>
          <p className="waiting-aside">The screen stayed dark.<br />You looked anyway.</p>
          <p className="waiting-linger" aria-live="polite">{waitingLingered ? "you stayed long enough for the minute to change." : ""}</p>
        </div>
      </section>

      <section id="almost-said-it" className={`scene scene--almost ${almostFolded ? "has-folded" : ""}`} data-chapter="04">
        <div className="almost-sticky">
          <Chapter number="04" label="ALMOST SAID IT" />
          <div className="almost-copy">
            <p>before you typed anything,</p>
            <h2>You almost<br /><em>said it.</em></h2>
            <strong>Then made the feeling smaller enough to carry.</strong>
          </div>
          <FoldedConfession
            folded={almostFolded}
            onFolded={() => setAlmostFolded(true)}
            onUnfolded={() => setAlmostFolded(false)}
          />
          <p className="almost-result" aria-live="polite">
            {almostFolded ? "you folded it instead." : "swipe left across the paper."}
          </p>
          <p className="almost-backtrack" aria-hidden="true">you came back to the line.</p>
        </div>
      </section>

      <section id="unsent" className="scene scene--unsent" data-chapter="05">
        <div className="unsent-sticky">
          <Chapter number="05" label="ALMOST SAID TOO MUCH" light />
          <div className="unsent-copy">
            <p>you typed it.</p>
            <h2>Then decided<br />it was <em>too much.</em></h2>
            <span>erase the sentence. see what actually disappears.</span>
          </div>
          <div className={`draft-paper ${ghostDraft && !draft ? "is-erased" : ""} ${restoringDraft ? "is-restoring" : ""}`}>
            <textarea value={draft} maxLength={180} aria-label="An unsent message" onChange={(event) => setDraft(event.currentTarget.value)} />
            {ghostDraft && !draft && <p className="draft-ghost" aria-hidden="true">{ghostDraft}</p>}
            {ghostDraft && !draft && <DraftDebris words={ghostWords} restoring={restoringDraft} />}
            <button className="draft-action" type="button" disabled={restoringDraft || (!draft && !ghostDraft)} onClick={draft ? eraseDraft : restoreDraft}>
              {draft ? "erase the words" : restoringDraft ? "the words remember" : "bring them back"}
            </button>
          </div>
          <div className="unsent-result" aria-live="polite">
            <span>{ghostDraft && !draft ? "the words are gone." : "the cursor waited with you."}</span>
            <strong>{ghostDraft && !draft ? "the thought isn't." : "you still haven't sent it."}</strong>
          </div>
        </div>
      </section>

      <section id="memories" className={`scene scene--memories ${photoDeveloped ? "has-developed-photo" : ""}`} data-chapter="06">
        <div className="memories-sticky">
          <Image className="memories-image" src="/art/archive-gpt-image-2.png" alt="" fill sizes="100vw" />
          <div className="memories-shade" aria-hidden="true" />
          <Chapter number="06" label="YOU MADE MEMORIES" light />
          <div className="memories-copy">
            <p>after a while,</p>
            <h2>ordinary things<br />became <em>yours.</em></h2>
          </div>
          <div className="memory-bloom" aria-hidden="true">
            <Image src="/art/motif-cutout.png" alt="" fill sizes="(max-width: 700px) 58vw, 34vw" />
          </div>
          <div className="film-strip" aria-label="Shared memories">
            {memories.map(([number, title, note], index) => (
              <InteractiveMemoryFrame
                key={title}
                index={index}
                number={number}
                title={title}
                note={note}
                moved={movedMemories.has(index)}
                onMoved={rememberMemoryMove}
                onDeveloped={() => setPhotoDeveloped(true)}
              />
            ))}
          </div>
          <div className="memory-collapse" aria-hidden="true">
            {memories.map(([number, title], index) => (
              <div
                key={`collapse-${title}`}
                className={`memory-collapse-card memory-collapse-card--${index + 1} ${movedMemories.has(index) ? "was-touched" : ""} ${index === 1 && photoDeveloped ? "is-developed" : ""}`}
                style={{
                  "--collapse-image": `url('${[
                    "/art/motif-gpt-image-1.png",
                    "/art/archive-gpt-image-2.png",
                    "/art/distance-gpt-image-2.png",
                    "/art/unsent-gpt-image-1.png",
                    "/art/reveal-gpt-image-2.png",
                  ][index]}')`,
                } as React.CSSProperties}
              >
                <i>{number}</i>
                <strong>{title}</strong>
              </div>
            ))}
            <p>in the end, it was one ordinary day.</p>
          </div>
          <p className="memories-footnote">There was no moment where it became important.<br />It just kept becoming important.</p>
        </div>
      </section>

      <section
        id="distance"
        className="scene scene--distance"
        data-chapter="07"
        style={{
          "--distance": `${distance}%`,
          "--distance-shift": `${Math.max(0, distance - 30) * 0.36}vw`,
          "--distance-tension": Math.max(0, Math.min(1, (distance - 18) / 70)),
        } as React.CSSProperties}
      >
        <div className="distance-sticky">
          <div className="distance-half distance-half--you" aria-hidden="true" />
          <div className="distance-half distance-half--them" aria-hidden="true" />
          <div className="distance-shade" aria-hidden="true" />
          <div className="distance-giants" aria-hidden="true"><span>you</span><span>them</span></div>
          <Chapter number="07" label="DISTANCE" light />
          <div className="distance-copy">
            <p>then something changed.</p>
            <h2>The pauses<br />got <em>longer.</em></h2>
            <span>one chair stayed empty.</span>
          </div>
          <div className={`distance-pull ${distanceDragging ? "is-pulling" : ""}`}>
            <div className="distance-pull__labels" aria-hidden="true"><span>you</span><span>them</span></div>
            <div className="distance-pull__thread" aria-hidden="true"><i /></div>
            <input
              type="range"
              min="18"
              max="88"
              value={distance}
              aria-label="Pull the distance between you and them"
              onPointerDown={() => setDistanceDragging(true)}
              onPointerUp={releaseDistance}
              onPointerCancel={releaseDistance}
              onChange={(event) => {
                setDistancePulledEver(true);
                setDistance(Number(event.currentTarget.value));
              }}
            />
            <small>{distance < 45 ? "close enough to pretend nothing changed" : distance < 72 ? "the thread stretches" : "still attached"}</small>
          </div>
          <button type="button" className="distance-check" onClick={() => setDistanceChecks((count) => count + 1)}>
            check anyway
            <small aria-live="polite">{distanceLine}</small>
          </button>
        </div>
      </section>

      <section id="trying-not-to-care" className="scene scene--trying" data-chapter="08">
        <div className="trying-sticky">
          <Chapter number="08" label="YOU TRIED NOT TO CARE" />
          <div className="trying-copy">
            <p>fine.</p>
            <h2>Do something<br />about it.</h2>
            <strong>Throw it away. Hide it. Cut it. Close it.</strong>
          </div>
          <div className="trying-table" aria-label="Things you try to get rid of">
            {thingsToLose.map(([key, verb, title], index) => (
              <button
                type="button"
                key={key}
                className={`loss-object loss-object--${key} loss-object--${index + 1} ${missing.has(key) ? "is-gone" : ""}`}
                aria-label={`${verb} ${title}`}
                onClick={() => tryToLose(key)}
                onPointerMove={moveLight}
              >
                <span>{verb}</span>
                <strong>{title}</strong>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="trying-answer" aria-live="polite">{attemptLine}</p>
        </div>
      </section>

      <section
        id="nothing-disappeared"
        className={`scene scene--nothing ${rememberedWaiting ? "remembers-waiting" : ""} ${distancePulledEver || distanceChecks > 0 ? "remembers-distance" : ""}`}
        data-chapter="09"
      >
        <div className="nothing-sticky">
          <Image className="nothing-image" src="/art/archive-gpt-image-2.png" alt="" fill sizes="100vw" />
          <div className="nothing-vignette" aria-hidden="true" />
          <MemoryStormCanvas intensity={memoryStormIntensity} />
          <div className="nothing-word" aria-hidden="true">nothing</div>
          <Chapter number="09" label="NOTHING DISAPPEARED" light />
          <div className="nothing-copy">
            <p>you did everything right.</p>
            <h2>Nothing really<br /><em>disappeared.</em></h2>
            <span>not the flower. not the photo. not the sentence.</span>
          </div>
          <div className="return-cloud" aria-hidden="true">
            <div className="return-piece return-piece--flower"><Image src="/art/motif-cutout.png" alt="" fill sizes="22vw" /></div>
            <div className={`return-piece return-piece--photo ${movedMemories.size ? "is-remembered" : ""}`}><Image src="/art/motif-gpt-image-1.png" alt="" fill sizes="22vw" /></div>
            <div className={`return-piece return-piece--message ${erasedEver ? "is-remembered" : ""}`}>I keep thinking about you.</div>
            <div className={`return-piece return-piece--ticket ${rememberedTicket ? "is-remembered" : ""}`}>row g · seat 12</div>
            <div className={`return-piece return-piece--note ${rememberedWaiting ? "is-remembered" : ""}`}>text me when you get home</div>
          </div>
          <div className={`nothing-thread ${distancePulledEver || distanceChecks > 0 ? "is-stretched" : ""} ${waitingLingered ? "is-lingering" : ""}`} aria-hidden="true"><i /></div>
        </div>
      </section>

      <section id="love-won" className={`scene scene--love ${letterOpen ? "is-open" : ""}`} data-chapter="10">
        <div className="love-sticky">
          <Image className="love-image" src="/art/reveal-gpt-image-2.png" alt="" fill sizes="100vw" />
          <div className="love-wash" aria-hidden="true" />
          <div className="love-final-word" aria-hidden="true">love</div>
          <Chapter number="10" label="LOVE WON" />
          <div className="love-copy">
            <p>so much for avoiding it.</p>
            <h2>Love won<br /><em>anyway.</em></h2>
            <strong>You can stop pretending in here.</strong>
          </div>
          <div className={`final-letter ${letterHolding ? "is-holding" : ""} ${lostEver.has("letter") ? "was-closed" : ""}`}>
            <div className="final-letter__back" />
            <div className="final-letter__page">
              <span>{letterOpen ? finalMemoryLine : "still thinking about them?"}</span>
              <strong>{letterOpen ? "that was the answer." : "you already know."}</strong>
            </div>
            <div className="final-letter__flap" aria-hidden="true" />
            <button
              type="button"
              aria-pressed={letterOpen}
              onPointerDown={beginLetterHold}
              onPointerUp={finishLetterPointer}
              onPointerLeave={clearLetterHold}
              onPointerCancel={clearLetterHold}
              onKeyDown={openLetterFromKeyboard}
              onClick={openLetter}
              disabled={letterOpen}
            >
              {letterOpen ? "leave it open" : letterHolding ? "keep holding · or tap" : "open the letter"}
            </button>
          </div>
          <footer className="love-footer">
            <span>avoid.love</span>
            <span>{letterOpen ? "keep it open." : "you already know."}</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

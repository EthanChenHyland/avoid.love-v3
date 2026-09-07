"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import DraftDebris from "./DraftDebris";
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
  const [draft, setDraft] = useState("I keep thinking about you.");
  const [ghostDraft, setGhostDraft] = useState("");
  const [restoringDraft, setRestoringDraft] = useState(false);
  const [movedMemories, setMovedMemories] = useState<Set<number>>(() => new Set());
  const [photoDeveloped, setPhotoDeveloped] = useState(false);
  const [distance, setDistance] = useState(36);
  const [distanceDragging, setDistanceDragging] = useState(false);
  const [distanceChecks, setDistanceChecks] = useState(0);
  const [missing, setMissing] = useState<Set<ThingKey>>(() => new Set());
  const [lastAttempt, setLastAttempt] = useState<ThingKey | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const returnTimers = useRef<Map<ThingKey, number>>(new Map());
  const restoreTimer = useRef<number | null>(null);
  const distanceRaf = useRef<number | null>(null);

  useEffect(() => {
    const timers = returnTimers.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      if (restoreTimer.current) window.clearTimeout(restoreTimer.current);
      if (distanceRaf.current) cancelAnimationFrame(distanceRaf.current);
    };
  }, []);

  const waitingLine = useMemo(() => {
    if (waitingChecks === 0) return "no message yet";
    if (waitingChecks === 1) return "still nothing.";
    if (waitingChecks === 2) return "you knew nothing had changed.";
    return "you checked anyway.";
  }, [waitingChecks]);
  const ghostWords = useMemo(() => ghostDraft.trim().split(/\s+/).filter(Boolean), [ghostDraft]);

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

  return (
    <main ref={rootRef} className={`love-journey ${letterOpen ? "love-journey--open" : ""}`}>
      <div className="journey-progress" aria-hidden="true"><i /></div>
      <LivingThread cut={missing.has("thread")} scarred={false} tension={distance} />

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

      <section id="them" className="scene scene--them" data-chapter="01">
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
          <div className="notice-points" aria-label="Things you noticed">
            {["the sleeve pushed up", "the pause before they laughed", "your name in their handwriting"].map((item, index) => (
              <button key={item} type="button" className={noticed.has(index) ? "is-noticed" : ""} onClick={() => toggleNotice(index)}>
                <i aria-hidden="true" />
                <span>{noticed.has(index) ? item : "notice"}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="little-things" className="scene scene--little" data-chapter="02">
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

      <section id="waiting" className={`scene scene--waiting waiting-checks--${Math.min(waitingChecks, 3)}`} data-chapter="03">
        <div className="waiting-sticky">
          <Image className="waiting-image" src="/art/unsent-gpt-image-1.png" alt="" fill sizes="100vw" />
          <div className="waiting-night" aria-hidden="true" />
          <div className="waiting-rain" aria-hidden="true" />
          <div className="waiting-clock" aria-hidden="true">00:47</div>
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
        </div>
      </section>

      <section id="unsent" className="scene scene--unsent" data-chapter="04">
        <div className="unsent-sticky">
          <Chapter number="04" label="ALMOST SAID TOO MUCH" light />
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

      <section id="memories" className={`scene scene--memories ${photoDeveloped ? "has-developed-photo" : ""}`} data-chapter="05">
        <div className="memories-sticky">
          <Image className="memories-image" src="/art/archive-gpt-image-2.png" alt="" fill sizes="100vw" />
          <div className="memories-shade" aria-hidden="true" />
          <Chapter number="05" label="YOU MADE MEMORIES" light />
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
          <p className="memories-footnote">There was no moment where it became important.<br />It just kept becoming important.</p>
        </div>
      </section>

      <section
        id="distance"
        className="scene scene--distance"
        data-chapter="06"
        style={{
          "--distance": `${distance}%`,
          "--distance-shift": `${Math.max(0, distance - 30) * 0.36}vw`,
        } as React.CSSProperties}
      >
        <div className="distance-sticky">
          <div className="distance-half distance-half--you" aria-hidden="true" />
          <div className="distance-half distance-half--them" aria-hidden="true" />
          <div className="distance-shade" aria-hidden="true" />
          <div className="distance-giants" aria-hidden="true"><span>you</span><span>them</span></div>
          <Chapter number="06" label="DISTANCE" light />
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
              onChange={(event) => setDistance(Number(event.currentTarget.value))}
            />
            <small>{distance < 45 ? "close enough to pretend nothing changed" : distance < 72 ? "the thread stretches" : "still attached"}</small>
          </div>
          <button type="button" className="distance-check" onClick={() => setDistanceChecks((count) => count + 1)}>
            check anyway
            <small aria-live="polite">{distanceLine}</small>
          </button>
        </div>
      </section>

      <section id="trying-not-to-care" className="scene scene--trying" data-chapter="07">
        <div className="trying-sticky">
          <Chapter number="07" label="YOU TRIED NOT TO CARE" />
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

      <section id="nothing-disappeared" className="scene scene--nothing" data-chapter="08">
        <div className="nothing-sticky">
          <Image className="nothing-image" src="/art/archive-gpt-image-2.png" alt="" fill sizes="100vw" />
          <div className="nothing-vignette" aria-hidden="true" />
          <MemoryStormCanvas intensity={Math.max(1, attempts)} />
          <div className="nothing-word" aria-hidden="true">nothing</div>
          <Chapter number="08" label="NOTHING DISAPPEARED" light />
          <div className="nothing-copy">
            <p>you did everything right.</p>
            <h2>Nothing really<br /><em>disappeared.</em></h2>
            <span>not the flower. not the photo. not the sentence.</span>
          </div>
          <div className="return-cloud" aria-hidden="true">
            <div className="return-piece return-piece--flower"><Image src="/art/motif-cutout.png" alt="" fill sizes="22vw" /></div>
            <div className="return-piece return-piece--photo"><Image src="/art/motif-gpt-image-1.png" alt="" fill sizes="22vw" /></div>
            <div className="return-piece return-piece--message">I keep thinking about you.</div>
            <div className="return-piece return-piece--ticket">row g · seat 12</div>
            <div className="return-piece return-piece--date">11</div>
            <div className="return-piece return-piece--note">text me when you get home</div>
          </div>
          <div className="nothing-thread" aria-hidden="true"><i /></div>
        </div>
      </section>

      <section id="love-won" className={`scene scene--love ${letterOpen ? "is-open" : ""}`} data-chapter="09">
        <div className="love-sticky">
          <Image className="love-image" src="/art/reveal-gpt-image-2.png" alt="" fill sizes="100vw" />
          <div className="love-wash" aria-hidden="true" />
          <div className="love-final-word" aria-hidden="true">love</div>
          <Chapter number="09" label="LOVE WON" />
          <div className="love-copy">
            <p>so much for avoiding it.</p>
            <h2>Love won<br /><em>anyway.</em></h2>
            <strong>You can stop pretending in here.</strong>
          </div>
          <div className="final-letter">
            <div className="final-letter__back" />
            <div className="final-letter__page">
              <span>{letterOpen ? "you kept all of it because it mattered." : "still thinking about them?"}</span>
              <strong>{letterOpen ? "that was the answer." : "you already know."}</strong>
            </div>
            <div className="final-letter__flap" aria-hidden="true" />
            <button type="button" onClick={() => setLetterOpen(true)} disabled={letterOpen}>
              {letterOpen ? "leave it open" : "open the letter"}
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

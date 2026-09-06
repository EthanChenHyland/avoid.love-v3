"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

type Choice = "no" | "maybe" | "irrelevant";

const choiceCopy: Record<Choice, string> = {
  no: "no",
  maybe: "maybe",
  irrelevant: "that's irrelevant",
};

const choiceResponse: Record<Choice, string> = {
  no: "FAST ANSWER. interesting.",
  maybe: "ambiguity logged.",
  irrelevant: "avoidance detected.",
};

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function AttachmentScreening() {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const transitionRef = useRef<HTMLElement>(null);
  const evidenceRef = useRef<HTMLElement>(null);
  const archiveRef = useRef<HTMLElement>(null);
  const distanceStoryRef = useRef<HTMLElement>(null);
  const interventionRef = useRef<HTMLElement>(null);
  const protocolRef = useRef<HTMLElement>(null);
  const voidRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLElement>(null);
  const hoverStarted = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const reverseDistance = useRef(0);
  const revisitCalled = useRef(false);

  const [choice, setChoice] = useState<Choice | null>(null);
  const [hesitationDetected, setHesitationDetected] = useState(false);
  const [systemNote, setSystemNote] = useState("baseline appears normal.");
  const [elapsed, setElapsed] = useState(0);
  const [draftDeleted, setDraftDeleted] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState("draft sequence reconstructed.");
  const [interventionLevel, setInterventionLevel] = useState(0);
  const [distanceChecked, setDistanceChecked] = useState(false);
  const [released, setReleased] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const clock = window.setInterval(() => {
      const next = Math.floor((Date.now() - start) / 1000);
      setElapsed(next);
      if (next === 9 && !choice) setSystemNote("still deciding? that's data too.");
      if (next === 47) setSystemNote("47 seconds on avoid.love. this is not helping your case.");
    }, 1000);
    return () => window.clearInterval(clock);
  }, [choice]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !finePointer) return;

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      hero.style.setProperty("--pointer-x", x.toFixed(3));
      hero.style.setProperty("--pointer-y", y.toFixed(3));
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current < lastScrollY.current && current > window.innerHeight * 0.7) {
        reverseDistance.current += lastScrollY.current - current;
      } else if (current > lastScrollY.current) {
        reverseDistance.current = Math.max(0, reverseDistance.current - 8);
      }

      if (reverseDistance.current > 180 && !revisitCalled.current) {
        revisitCalled.current = true;
        setSystemNote("checking again?");
      }
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add({ isMobile: "(max-width: 640px)" }, (mediaContext) => {
        const isMobile = Boolean(mediaContext.conditions?.isMobile);

      gsap.from(".hero-wordmark .char", {
        yPercent: 120,
        rotate: 2,
        duration: 1.15,
        stagger: 0.035,
        ease: "power4.out",
        delay: 0.15,
      });

      gsap.from(".assessment-copy, .question-object, .system-rail", {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.7,
      });

      gsap.from(".separator-rig", {
        opacity: 0,
        x: 90,
        rotate: 2.5,
        duration: 1.35,
        ease: "power4.out",
        delay: 0.42,
      });

      gsap.from(".rig-carriage--them .rig-carriage-motion", {
        x: isMobile ? 34 : 90,
        duration: 1.55,
        ease: "expo.out",
        delay: 0.65,
      });

      if (transitionRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: transitionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.9,
          },
        });

        tl.to(".transition-node--left", { x: isMobile ? "25vw" : "34vw", ease: "none" }, 0)
          .to(".transition-node--right", { x: isMobile ? "-25vw" : "-34vw", ease: "none" }, 0)
          .to(".distance-rule", { scaleX: 0.14, ease: "none" }, 0)
          .to(".distance-value", { opacity: 0.15, y: -16, ease: "none" }, 0.2)
          .to(".collapse-warning", { opacity: 1, y: 0, ease: "none" }, 0.48)
          .to(".transition-thread", { strokeDashoffset: 0, ease: "none" }, 0.08)
          .to(".transition-curtain", { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0.58);
      }

      if (evidenceRef.current) {
        const evidenceTl = gsap.timeline({
          scrollTrigger: {
            trigger: evidenceRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.05,
          },
        });

        evidenceTl
          .to(".evidence-title-lockup", { y: "-17vh", scale: 0.82, opacity: 0.28, ease: "none" }, 0)
          .fromTo(
            ".evidence-sheet--focus",
            { y: "31vh", scale: 0.72, rotate: -5, opacity: 0.5 },
            { y: "-2vh", scale: 1, rotate: -1.5, opacity: 1, ease: "none" },
            0.04,
          )
          .to(".evidence-sheet--one", { x: isMobile ? -72 : -165, y: isMobile ? -42 : -88, scale: isMobile ? 1.08 : 1.22, rotate: -12, opacity: 0.24, filter: isMobile ? "none" : "blur(3px)", ease: "none" }, 0.08)
          .to(".evidence-sheet--two", { x: isMobile ? 76 : 175, y: isMobile ? -36 : -76, scale: isMobile ? 1.06 : 1.16, rotate: 10, opacity: 0.3, filter: isMobile ? "none" : "blur(2px)", ease: "none" }, 0.08)
          .to(".evidence-sheet--three", { x: isMobile ? -46 : -110, y: isMobile ? 32 : 72, scale: 1.06, rotate: 7, opacity: 0.5, ease: "none" }, 0.14)
          .to(".evidence-depth-word--left", { x: -120, opacity: 0.15, ease: "none" }, 0)
          .to(".evidence-depth-word--right", { x: 120, opacity: 0.12, ease: "none" }, 0)
          .fromTo(".evidence-comment", { opacity: 0, y: 46 }, { opacity: 1, y: 0, ease: "none" }, 0.5)
          .fromTo(".evidence-receipt", { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: "none" }, 0.42)
          .to(".evidence-thread path", { strokeDashoffset: -180, ease: "none" }, 0);
      }

      if (archiveRef.current) {
        const archiveTl = gsap.timeline({
          scrollTrigger: {
            trigger: archiveRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        archiveTl
          .fromTo(".archive-specimen--photo", { y: "18vh", rotate: -14 }, { y: "-6vh", rotate: -5, ease: "none" }, 0)
          .fromTo(".archive-specimen--receipt", { y: "28vh", rotate: 12 }, { y: "2vh", rotate: 5, ease: "none" }, 0.05)
          .fromTo(".archive-specimen--note", { y: "22vh", rotate: 8 }, { y: "-3vh", rotate: 2, ease: "none" }, 0.08)
          .to(".archive-word", { xPercent: -8, opacity: 0.17, ease: "none" }, 0)
          .to(".archive-scanline", { y: "63vh", ease: "none" }, 0.08)
          .fromTo(".archive-verdict", { opacity: 0, y: 42 }, { opacity: 1, y: 0, ease: "none" }, 0.54)
          .to(".archive-thread path", { strokeDashoffset: -250, ease: "none" }, 0);
      }

      if (distanceStoryRef.current) {
        const distanceTl = gsap.timeline({
          scrollTrigger: {
            trigger: distanceStoryRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.15,
          },
        });

        distanceTl
          .fromTo(".distance-story__image", { scale: 1.08, xPercent: -1.5 }, { scale: 1.015, xPercent: 1.5, ease: "none" }, 0)
          .to(".distance-pair--you", { x: "-8vw", opacity: 0.46, ease: "none" }, 0.08)
          .to(".distance-pair--them", { x: "8vw", opacity: 0.46, ease: "none" }, 0.08)
          .to(".distance-story__thread path", { strokeDashoffset: -180, ease: "none" }, 0)
          .fromTo(".distance-question", { opacity: 0, y: 26 }, { opacity: 1, y: 0, ease: "none" }, 0.54)
          .fromTo(".distance-petal", { y: -8, rotate: -8 }, { y: 32, rotate: 13, ease: "none" }, 0.2);
      }

      if (interventionRef.current) {
        const interventionTl = gsap.timeline({
          scrollTrigger: {
            trigger: interventionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.95,
          },
        });

        interventionTl
          .fromTo(".intervention-wheel", { rotate: -8, scale: 0.82 }, { rotate: 18, scale: 1.08, ease: "none" }, 0)
          .fromTo(".task-slip--one", { x: isMobile ? "14vw" : "32vw", y: isMobile ? "10vh" : "18vh" }, { x: isMobile ? "-2vw" : "-4vw", y: isMobile ? "-2vh" : "-4vh", ease: "none" }, 0.03)
          .fromTo(".task-slip--two", { x: isMobile ? "-13vw" : "-28vw", y: isMobile ? "13vh" : "24vh" }, { x: isMobile ? "3vw" : "6vw", y: isMobile ? "2vh" : "3vh", ease: "none" }, 0.08)
          .fromTo(".task-slip--three", { x: isMobile ? "12vw" : "24vw", y: isMobile ? "16vh" : "30vh" }, { x: isMobile ? "-4vw" : "-8vw", y: isMobile ? "4vh" : "8vh", ease: "none" }, 0.14)
          .fromTo(".task-slip--four", { x: isMobile ? "-11vw" : "-22vw", y: isMobile ? "18vh" : "34vh" }, { x: isMobile ? "5vw" : "10vw", y: isMobile ? "7vh" : "13vh", ease: "none" }, 0.19)
          .to(".intervention-thread path", { strokeDashoffset: -380, ease: "none" }, 0)
          .fromTo(".intervention-escalation", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.58);
      }

      if (protocolRef.current) {
        const protocolTl = gsap.timeline({
          scrollTrigger: {
            trigger: protocolRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1,
          },
        });

        protocolTl
          .to(".protocol-jaw--left", { x: isMobile ? "15vw" : "21vw", ease: "none" }, 0)
          .to(".protocol-jaw--right", { x: isMobile ? "-15vw" : "-21vw", ease: "none" }, 0)
          .to(".protocol-gap", { scaleX: 0.08, ease: "none" }, 0)
          .to(".protocol-needle", { rotate: 68, ease: "none" }, 0.04)
          .to(".protocol-thread", { scaleY: 1.42, ease: "none" }, 0.12)
          .fromTo(".protocol-pressure", { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "none" }, 0.42)
          .fromTo(".protocol-stamp", { opacity: 0, scale: 1.6, rotate: -12 }, { opacity: 1, scale: 1, rotate: -4, ease: "none" }, 0.68)
          .to(".protocol-shell", { filter: "brightness(.88) saturate(.82)", ease: "none" }, 0.72);
      }

      if (voidRef.current) {
        const voidTl = gsap.timeline({
          scrollTrigger: {
            trigger: voidRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        });

        voidTl
          .fromTo(".void-line--one", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.1)
          .fromTo(".void-line--two", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.34)
          .fromTo(".void-line--three", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.62)
          .to(".void-remnant", { rotate: 4, y: "2vh", ease: "none" }, 0)
          .to(".void-thread path", { strokeDashoffset: -120, ease: "none" }, 0);
      }

      if (revealRef.current) {
        const revealTl = gsap.timeline({
          scrollTrigger: {
            trigger: revealRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        revealTl
          .fromTo(".reveal-wash", { opacity: 0 }, { opacity: 1, ease: "none" }, 0)
          .to(".reveal-presence--you", { x: isMobile ? "7vw" : "10vw", ease: "none" }, 0.02)
          .to(".reveal-presence--them", { x: isMobile ? "-7vw" : "-10vw", ease: "none" }, 0.02)
          .to(".reveal-divider", { scaleX: 0, opacity: 0, ease: "none" }, 0.18)
          .to(".reveal-needle", { rotate: -42, opacity: 0.25, ease: "none" }, 0.08)
          .fromTo(".reveal-title", { y: "14vh", opacity: 0.15 }, { y: 0, opacity: 1, ease: "none" }, 0.3)
          .fromTo(".reveal-copy", { opacity: 0, y: 28 }, { opacity: 1, y: 0, ease: "none" }, 0.64)
          .to(".reveal-machine", { opacity: 0, ease: "none" }, 0.58)
          .to(".reveal-header", { opacity: 0.08, ease: "none" }, 0.72)
          .to(".reveal-thread path", { strokeDashoffset: -220, ease: "none" }, 0);
      }
      });

      return () => media.revert();
    }, rootRef);

    return () => {
      context.revert();
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleChoiceEnter = () => {
    hoverStarted.current = performance.now();
  };

  const handleChoiceLeave = () => {
    if (choice || hoverStarted.current === null) return;
    const hesitation = performance.now() - hoverStarted.current;
    hoverStarted.current = null;
    if (hesitation > 850) {
      setHesitationDetected(true);
      setSystemNote(`you hovered for ${(hesitation / 1000).toFixed(1)}s. no rush.`);
    }
  };

  const handleChoice = (next: Choice) => {
    setChoice(next);
    setHesitationDetected(false);
    setSystemNote(choiceResponse[next]);
  };

  const deleteDraft = () => {
    if (draftDeleted) {
      setEvidenceNote("checking the deletion again?");
      return;
    }
    setDraftDeleted(true);
    setEvidenceNote("deleted text recovered. awkward.");
  };

  const applyIntervention = () => {
    setInterventionLevel((current) => Math.min(current + 1, 3));
  };

  const interventionNote = [
    "select a corrective action.",
    "pottery queued. this should fix everything.",
    "spotify reorganized. still thinking about them?",
    "additional distractions no longer available.",
  ][interventionLevel];

  return (
    <main
      ref={rootRef}
      className={`experience-shell ${choice ? `choice-${choice}` : ""} ${hesitationDetected ? "is-hesitating" : ""} intervention-level-${interventionLevel} ${distanceChecked ? "is-distance-checked" : ""} ${released ? "is-released" : ""}`}
    >
      <section ref={heroRef} className="assessment-scene" aria-labelledby="screening-title">
        <div className="paper-field" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-art" aria-hidden="true">
          <Image
            className="hero-art__image"
            src="/art/hero-gpt.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-art__grade" />
          <span className="hero-art__caption">EVIDENCE / FLOWER + LETTER + THREAD</span>
        </div>
        <div className="screening-bench" aria-hidden="true">
          <span className="bench-seam bench-seam--one" />
          <span className="bench-seam bench-seam--two" />
          <span className="bench-registration">04</span>
        </div>

        <header className="system-rail">
          <div className="system-id">
            <span className="status-dot" />
            <span>00 / ATTACHMENT SCREENING</span>
          </div>
          <div className="rail-center">CASE / YOU</div>
          <div className="rail-time">ELAPSED {formatElapsed(elapsed)}</div>
        </header>

        <div className="separator-rig" aria-hidden="true">
          <div className="rig-cast-shadow" />
          <div className="rig-underplate">
            <span className="rig-serial">ATTACHMENT SEPARATOR / 04</span>
            <span className="rig-caution">CALIBRATED FOR DENIAL</span>
            <div className="rig-tick-field" />
          </div>
          <div className="rig-rail">
            <span className="rig-rail-edge" />
            <span className="rig-knurl rig-knurl--left" />
            <span className="rig-knurl rig-knurl--right" />
          </div>
          <div className="rig-carriage rig-carriage--you">
            <div className="rig-yoke"><i /><i /></div>
            <div className="rig-specimen rig-specimen--you"><span>YOU</span></div>
            <div className="rig-clamp"><b /></div>
          </div>
          <div className="rig-carriage rig-carriage--them">
            <div className="rig-carriage-motion">
              <div className="rig-yoke"><i /><i /></div>
              <div className="rig-specimen rig-specimen--them"><span>THEM</span></div>
              <div className="rig-clamp"><b /></div>
            </div>
          </div>
          <div className="rig-readout">
            <span>RECOMMENDED EMOTIONAL DISTANCE</span>
            <strong>
              {choice === "no" ? "2.1 m" : choice === "maybe" ? "1.6 m" : choice === "irrelevant" ? "0.9 m" : "2.4 m"}
            </strong>
            <em>DO NOT REDUCE</em>
          </div>
          <div className="rig-dial"><i className="rig-needle" /><span>TENSION</span></div>
          <div className="rig-foreground-arm">
            <span className="rig-screw rig-screw--top" />
            <span className="rig-screw rig-screw--bottom" />
          </div>
          <svg className="hero-thread" viewBox="0 0 1000 760" preserveAspectRatio="none">
            <path d="M-70,575 C180,530 290,452 392,472 C492,491 510,408 592,421 C690,438 720,334 1080,280" />
          </svg>
        </div>

        <div className="hero-main">
          <p className="eyebrow">A SYSTEM FOR PEOPLE TRYING NOT TO GET ATTACHED</p>
          <h1 id="screening-title" className="hero-wordmark" aria-label="avoid.love">
            {"avoid.love".split("").map((char, index) => (
              <span className="char" key={`${char}-${index}`} aria-hidden="true">
                {char}
              </span>
            ))}
          </h1>
          <div className="assessment-copy">
            <span>We need to ask you a few questions.</span>
            <span>This will only take a minute.</span>
            <em>Probably.</em>
          </div>
          <div className="beginning-log">
            <span>FIRST ANOMALY / 00:43:12</span>
            <strong>you stayed talking forty-three minutes longer than planned.</strong>
            <em>you remembered the joke the next morning.</em>
          </div>
        </div>

        <div className="question-object">
          <div className="question-clip" aria-hidden="true"><i /><i /></div>
          <div className="question-index">
            <span>01 / 03</span>
            <span>INITIAL BASELINE</span>
          </div>
          <h2>Have you checked their messages today?</h2>
          <div className="answer-field" aria-label="Answer the attachment screening question">
            {(Object.keys(choiceCopy) as Choice[]).map((answer, index) => (
              <button
                key={answer}
                type="button"
                className={`answer-tag answer-tag--${index + 1} ${choice === answer ? "is-selected" : ""}`}
                onPointerEnter={handleChoiceEnter}
                onPointerLeave={handleChoiceLeave}
                onFocus={handleChoiceEnter}
                onBlur={handleChoiceLeave}
                onClick={() => handleChoice(answer)}
              >
                <span>{choiceCopy[answer]}</span>
                <small>{String(index + 1).padStart(2, "0")}</small>
              </button>
            ))}
          </div>
          <div className="system-observation" aria-live="polite">
            <span className="observation-mark">↳</span>
            <span>{systemNote}</span>
          </div>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>CONTINUE ASSESSMENT</span>
          <i />
        </div>
      </section>

      <section ref={transitionRef} className="distance-collapse" aria-label="Emotional distance calculation">
        <div className="transition-sticky">
          <div className="transition-grid" aria-hidden="true" />
          <div className="transition-kicker">01 / DENIAL ROUTINE</div>

          <div className="denial-evidence" aria-hidden="true">
            <Image src="/art/hero-gpt.png" alt="" fill sizes="32vw" />
            <span>CLASSIFICATION / INCIDENTAL</span>
            <i>MEANINGLESS</i>
          </div>

          <div className="transition-measure" aria-hidden="true">
            <div className="transition-node transition-node--left">
              <span>YOU</span>
              <i className="transition-jaw" />
            </div>
            <div className="distance-rule">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="transition-node transition-node--right">
              <span>THEM</span>
              <i className="transition-jaw" />
            </div>
          </div>

          <div className="transition-spindle" aria-hidden="true"><i /><span>04</span></div>

          <div className="distance-value">
            <span>SAFE DISTANCE</span>
            <strong>2.4 m</strong>
          </div>

          <div className="collapse-warning">
            <span>DENIAL FAILURE</span>
            <strong>you looked for them in the room anyway.</strong>
          </div>

          <svg className="transition-thread" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,600 C260,620 430,420 630,490 C820,555 850,380 1050,435 C1240,490 1330,620 1600,520" />
          </svg>

          <div className="transition-curtain" aria-hidden="true">
            <div className="curtain-depth" />
            <div className="curtain-copy">EVIDENCE FOUND / UNSENT</div>
          </div>
        </div>
      </section>

      <section ref={evidenceRef} className="evidence-scene" aria-labelledby="evidence-title">
        <div className="evidence-sticky">
          <div className="evidence-light" aria-hidden="true" />
          <div className="evidence-grid" aria-hidden="true" />
          <div className="evidence-depth-word evidence-depth-word--left" aria-hidden="true">goodnight</div>
          <div className="evidence-depth-word evidence-depth-word--right" aria-hidden="true">made it home</div>

          <header className="evidence-header">
            <span>02 / UNSENT</span>
            <span>CONFIDENCE 87%</span>
          </header>

          <div className="evidence-title-lockup">
            <p>Recovered from absolutely nowhere in particular.</p>
            <h2 id="evidence-title">UNSENT</h2>
            <span className="evidence-subtitle">You typed it. You deleted it. We noticed the pattern.</span>
          </div>

          <svg className="evidence-thread" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-80,202 C245,150 340,342 585,292 C782,252 915,390 1114,327 C1300,268 1440,180 1690,244" />
          </svg>

          <div className="draft-stage">
          <article className="evidence-sheet evidence-sheet--one" aria-hidden="true">
            <span className="sheet-clip" />
            <header>21:43:12 / DRAFT 01</header>
            <p>hey I had fun tonight :)</p>
            <footer>DISCARDED</footer>
          </article>

          <article className="evidence-sheet evidence-sheet--two" aria-hidden="true">
            <span className="sheet-clip" />
            <header>21:44:08 / DRAFT 02</header>
            <p>thanks for tonight</p>
            <footer>DISCARDED</footer>
          </article>

          <article className="evidence-sheet evidence-sheet--three" aria-hidden="true">
            <span className="sheet-clip" />
            <header>21:46:31 / DRAFT 03</header>
            <p>made it home</p>
            <footer>DISCARDED</footer>
          </article>

          <article className={`evidence-sheet evidence-sheet--focus ${draftDeleted ? "is-deleted" : ""}`}>
            <span className="sheet-clip sheet-clip--focus" aria-hidden="true" />
            <header>
              <span>21:48:04 / DRAFT 04</span>
              <span>UNSENT</span>
            </header>
            <div className="draft-content">
              <span className="typing-caret" />
              <p>{draftDeleted ? "" : "I keep thinking about—"}</p>
            </div>
            <footer>
              <button type="button" onClick={deleteDraft}>
                {draftDeleted ? "check deletion" : "delete draft"}
              </button>
              <span>{draftDeleted ? "0 characters" : "22 characters"}</span>
            </footer>
          </article>

          <span className="evidence-petal" aria-hidden="true" />

          <div className={`deleted-ghost ${draftDeleted ? "is-visible" : ""}`} aria-hidden="true">
            I keep thinking about—
          </div>

          <div className="evidence-receipt" aria-hidden="true">
            <span>MEMORY LOG</span>
            <b>coffee order</b>
            <b>usual wake time</b>
            <b>one tiny thing they said</b>
            <em>all retained</em>
          </div>

          <div className="evidence-ruler" aria-hidden="true">
            <span>DETACHMENT</span>
            <i />
            <i />
            <i />
            <i />
            <i />
            <span>ATTACHMENT</span>
          </div>
          </div>

          <div className="evidence-comment" aria-live="polite">
            <span>system note /</span>
            <strong>{draftDeleted ? evidenceNote : "very detached."}</strong>
          </div>
        </div>

        <div className="proof-ending">
          <span>EVIDENCE THRESHOLD</span>
          <strong>denial no longer statistically useful.</strong>
          <em>continuing anyway.</em>
        </div>
      </section>

      <section ref={archiveRef} className="archive-scene" aria-labelledby="archive-title">
        <div className="archive-sticky">
          <div className="archive-art" aria-hidden="true">
            <Image className="archive-art__image" src="/art/archive-gpt-image-2.png" alt="" fill sizes="100vw" />
            <div className="archive-art__grade" />
          </div>
          <div className="archive-shadow archive-shadow--left" aria-hidden="true" />
          <div className="archive-shadow archive-shadow--right" aria-hidden="true" />
          <div className="archive-word" aria-hidden="true">EVIDENCE</div>
          <div className="archive-scanline" aria-hidden="true" />

          <header className="archive-header">
            <span>03 / THE LITTLE THINGS</span>
            <span>PLEASE DO NOT ASSIGN MEANING</span>
          </header>

          <div className="archive-heading">
            <p>You remembered something small they said three weeks ago.</p>
            <h2 id="archive-title">That is not ideal.</h2>
          </div>

          <svg className="archive-thread" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-80,320 C220,280 300,460 520,405 C760,346 820,585 1090,455 C1290,360 1430,330 1680,390" />
          </svg>

          <div className="archive-table" aria-label="Fictional emotional evidence">
            <article className="archive-specimen archive-specimen--photo">
              <span className="archive-pin" aria-hidden="true" />
              <div className="photo-window" aria-hidden="true">
                <i className="photo-cup photo-cup--one" />
                <i className="photo-cup photo-cup--two" />
                <span className="photo-shadow-line" />
              </div>
              <footer><span>FILE 04-A</span><b>the place you said was “fine”</b></footer>
            </article>

            <article className="archive-specimen archive-specimen--receipt">
              <span className="archive-pin" aria-hidden="true" />
              <header>MEMORY RECEIPT / 11:14</header>
              <strong>oat latte</strong>
              <strong>one sugar</strong>
              <strong>no cinnamon</strong>
              <em>retained without request</em>
            </article>

            <article className="archive-specimen archive-specimen--note">
              <span className="archive-pin" aria-hidden="true" />
              <small>TRANSCRIPT FRAGMENT</small>
              <p>“text me when you get home”</p>
              <b>replayed: 6×</b>
            </article>

            <div className="archive-tag archive-tag--song" aria-hidden="true">
              <span>02:13</span>
              <b>the part of the song you noticed</b>
            </div>
            <div className="archive-tag archive-tag--time" aria-hidden="true">
              <span>07:42</span>
              <b>usual wake time</b>
            </div>
          </div>

          <div className="archive-verdict">
            <span>SYSTEM NOTE /</span>
            <strong>You call these coincidences.</strong>
          </div>
        </div>
      </section>

      <section ref={distanceStoryRef} className="distance-story" aria-labelledby="distance-story-title">
        <div className="distance-story__sticky">
          <Image
            className="distance-story__image"
            src="/art/distance-gpt-image-2.png"
            alt=""
            fill
            sizes="100vw"
          />
          <div className="distance-story__shade" aria-hidden="true" />

          <header className="distance-story__header">
            <span>04 / DISTANCE</span>
            <span>MESSAGES / LESS FREQUENT</span>
          </header>

          <div className="distance-story__copy">
            <p>Something changed. The pauses got longer.</p>
            <h2 id="distance-story-title">GOOD.</h2>
            <span>the system considers this progress.</span>
          </div>

          <div className="distance-pair distance-pair--you" aria-hidden="true">
            <span>YOU</span>
            <b>23:18</b>
          </div>
          <div className="distance-pair distance-pair--them" aria-hidden="true">
            <span>THEM</span>
            <b>08:41</b>
          </div>

          <svg className="distance-story__thread" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-80,610 C300,575 430,620 650,600 C900,576 1110,618 1690,580" />
          </svg>
          <span className="distance-petal" aria-hidden="true" />
          <p className="distance-question">why are you still checking?</p>
          <div className="distance-checkpoint">
            <button type="button" onClick={() => setDistanceChecked(true)} disabled={distanceChecked}>
              {distanceChecked ? "CHECKED." : "CHECK ANYWAY"}
            </button>
            <span>{distanceChecked ? "nothing new. you knew that before you looked." : "no new messages since 08:41"}</span>
          </div>
        </div>
      </section>

      <section ref={interventionRef} className="intervention-scene" aria-labelledby="intervention-title">
        <div className="intervention-sticky">
          <div className="intervention-sun" aria-hidden="true" />
          <div className="intervention-wheel" aria-hidden="true">
            <span className="wheel-hub">05</span>
            <i /><i /><i /><i /><i /><i /><i /><i />
          </div>

          <header className="intervention-header">
            <span>05 / CORRECTIVE ACTION</span>
            <span>ATTACHMENT LEVEL: UNCOOPERATIVE</span>
          </header>

          <div className="intervention-heading">
            <p>Fine. We can fix this.</p>
            <h2 id="intervention-title">DO SOMETHING ELSE.</h2>
          </div>

          <svg className="intervention-thread" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-50,530 C260,420 350,650 620,520 C850,410 985,610 1180,500 C1370,395 1510,490 1660,455" />
          </svg>

          <div className="intervention-memory" aria-hidden="true">
            <span className="intervention-memory__petal" />
            <i>this reminded me of you</i>
          </div>

          <div className="task-field">
            <div className="task-slip task-slip--one"><span>01</span><strong>LEARN POTTERY</strong><em>estimated relief: 14 min</em></div>
            <div className="task-slip task-slip--two"><span>02</span><strong>REORGANIZE SPOTIFY</strong><em>do not make a playlist about this</em></div>
            <div className="task-slip task-slip--three"><span>03</span><strong>TAKE A WALK</strong><em>leave phone at home</em></div>
            <div className="task-slip task-slip--four"><span>04</span><strong>LEARN RUST</strong><em>borrow checker preferred</em></div>
            <div className="task-slip task-slip--five"><span>05</span><strong>WAIT 17 MINUTES</strong><em>minimum viable indifference</em></div>
          </div>

          <div className="intervention-console">
            <span>CORRECTIVE ACTION /</span>
            <strong>{interventionNote}</strong>
            <button type="button" onClick={applyIntervention} disabled={interventionLevel === 3}>
              {interventionLevel === 0 ? "APPLY DISTRACTION" : interventionLevel < 3 ? "TRY ANOTHER" : "NO MORE AVAILABLE"}
            </button>
          </div>

          <div className="intervention-escalation" aria-hidden="true">THIS IS BECOMING STATISTICALLY SIGNIFICANT.</div>
        </div>
      </section>

      <section ref={protocolRef} className="protocol-scene" aria-labelledby="protocol-title">
        <div className="protocol-sticky">
          <div className="protocol-art" aria-hidden="true">
            <Image className="protocol-art__image" src="/art/protocol-gpt-image-2.png" alt="" fill sizes="100vw" />
            <div className="protocol-art__grade" />
          </div>
          <div className="protocol-shell" aria-hidden="true">
            <div className="protocol-rail protocol-rail--top" />
            <div className="protocol-rail protocol-rail--bottom" />
            <div className="protocol-jaw protocol-jaw--left"><span>YOU</span><i /><i /></div>
            <div className="protocol-jaw protocol-jaw--right"><span>THEM</span><i /><i /></div>
            <div className="protocol-gap"><span>SAFE DISTANCE</span><strong>2.4 m</strong></div>
            <div className="protocol-gauge">
              <i className="protocol-needle" />
              <span>ATTACHMENT</span>
              <b>CONCERNING</b>
            </div>
            <div className="protocol-pressure">
              <span>RECIPROCITY RISK</span><b>UNKNOWN</b>
              <span>THOUGHT FREQUENCY</span><b>EXCESSIVE</b>
            </div>
            <div className="protocol-stamp">CONTAINMENT FAILED</div>
          </div>

          <svg className="protocol-thread" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-80,540 C220,610 315,305 555,500 C735,648 835,255 1060,470 C1260,662 1410,355 1690,480" />
          </svg>

          <header className="protocol-header">
            <span>06 / FINAL CONTAINMENT PROTOCOL</span>
            <span>MANUAL OVERRIDE UNAVAILABLE</span>
          </header>

          <div className="protocol-title-lockup">
            <p>Normal interventions failed.</p>
            <h2 id="protocol-title">HOLD<br />THE LINE.</h2>
          </div>
          <p className="sr-only">Containment failed. Reciprocity is unknown. Thought frequency remains excessive.</p>
        </div>
      </section>

      <section ref={voidRef} className="void-scene" aria-labelledby="void-title">
        <div className="void-sticky">
          <svg className="void-thread" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-100,480 C340,465 470,520 780,490 C1060,462 1290,510 1700,482" />
          </svg>
          <div className="void-remnant" aria-hidden="true">
            <span className="void-petal" />
          </div>
          <div className="void-copy">
            <h2 id="void-title" className="void-line void-line--one">We tried.</h2>
            <p className="void-line void-line--two">You could have left by now.</p>
            <strong className="void-line void-line--three">But you&apos;re still here.</strong>
          </div>
          <span className="void-oh">Oh.</span>
        </div>
      </section>

      <section ref={revealRef} className="reveal-scene" aria-labelledby="reveal-title">
        <div className="reveal-sticky">
          <div className="reveal-art" aria-hidden="true">
            <Image className="reveal-art__image" src="/art/reveal-gpt-image-2.png" alt="" fill sizes="100vw" />
            <div className="reveal-art__grade" />
          </div>
          <div className="reveal-wash" aria-hidden="true" />
          <div className="reveal-machine" aria-hidden="true">
            <div className="reveal-rail" />
            <div className="reveal-presence reveal-presence--you"><span>YOU</span></div>
            <div className="reveal-presence reveal-presence--them"><span>THEM</span></div>
            <div className="reveal-divider"><span>RECOMMENDED DISTANCE</span></div>
            <div className="reveal-gauge"><i className="reveal-needle" /><span>OFF</span></div>
          </div>

          <svg className="reveal-thread" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-80,500 C260,510 360,420 610,475 C840,525 930,410 1160,472 C1370,530 1510,465 1680,478" />
          </svg>

          <header className="reveal-header">
            <span>08 / SYSTEM RELEASE</span>
            <span>SEPARATION ROUTINE OFFLINE</span>
          </header>

          <div className="reveal-lockup">
            <p>We&apos;re going to stop measuring now.</p>
            <h2 id="reveal-title" className="reveal-title">avoidance<br />failed.</h2>
            <div className="reveal-copy">
              <strong>{released ? "they mattered. that is the whole result." : "you can stop pretending in here."}</strong>
              <span>{released ? "measurement ended" : "still thinking about them?"}</span>
              <button type="button" onClick={() => setReleased(true)} disabled={released}>
                {released ? "MACHINE OFF" : "STOP MEASURING"}
              </button>
            </div>
          </div>

          <footer className="reveal-footer">
            <span>avoid.love</span>
            <span>SCREENING COMPLETE / RESULT WITHHELD</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

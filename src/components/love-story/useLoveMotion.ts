import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function useLoveMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.style.setProperty("--story-progress", "1");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.04,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.08,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      root.style.setProperty("--story-progress", progress.toFixed(4));
    };

    lenis.on("scroll", ({ direction }) => {
      ScrollTrigger.update();
      updateProgress();
      root.dataset.scrollDirection = direction < 0 ? "backward" : "forward";
    });
    updateProgress();

    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add(
        {
          mobile: "(max-width: 700px)",
          desktop: "(min-width: 701px)",
        },
        (match) => {
          const mobile = Boolean(match.conditions?.mobile);

          gsap.timeline({
            scrollTrigger: {
              trigger: ".scene--fine",
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          })
            .to(".fine-quiet", { opacity: 0.08, ease: "none" }, 0)
            .to(".fine-warmth", { opacity: 1, ease: "none" }, 0.05)
            .to(".fine-image", { scale: 1, filter: "grayscale(0) saturate(.92) brightness(.92)", ease: "none" }, 0.05)
            .to(".fine-copy--before", { y: mobile ? -70 : -120, opacity: 0, ease: "none" }, 0.16)
            .fromTo(".fine-copy--them", { y: mobile ? 80 : 120, opacity: 0 }, { y: 0, opacity: 1, ease: "none" }, 0.3)
            .fromTo(".fine-cups", { opacity: 0, x: 40 }, { opacity: 1, x: 0, ease: "none" }, 0.48)
            .to(".fine-brand", { opacity: 0.2, y: -22, ease: "none" }, 0.62);

          gsap.timeline({
            scrollTrigger: {
              trigger: ".scene--them",
              start: "top 82%",
              endTrigger: ".scene--nothing",
              end: "bottom 22%",
              scrub: 1.1,
            },
          })
            .fromTo(".story-thread", { opacity: 0 }, { opacity: mobile ? 0.22 : 0.38, ease: "none" }, 0)
            .fromTo(".story-thread__line", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none" }, 0)
            .to(".story-thread", { opacity: mobile ? 0.08 : 0.14, ease: "none" }, 0.88);

          gsap.timeline({
            scrollTrigger: { trigger: ".scene--them", start: "top 82%", end: "bottom 20%", scrub: 0.9 },
          })
            .fromTo(".them-photo", { clipPath: "inset(16% 18% 18% 18%)", rotate: 4, scale: 0.9 }, { clipPath: "inset(0% 0% 0% 0%)", rotate: -2, scale: 1, ease: "none" }, 0)
            .fromTo(".them-word", { xPercent: 18, opacity: 0 }, { xPercent: -4, opacity: 0.12, ease: "none" }, 0.02)
            .fromTo(".them-flower", { xPercent: 42, yPercent: 22, rotate: 16, scale: 0.62, opacity: 0 }, { xPercent: 0, yPercent: 0, rotate: -8, scale: 1, opacity: 1, ease: "none" }, 0.12)
            .fromTo(".them-copy", { y: 70, opacity: 0.08 }, { y: mobile ? -20 : -45, opacity: 1, ease: "none" }, 0.05)
            .fromTo(".notice-points button", { x: 26, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, ease: "none" }, 0.38);

          gsap.timeline({
            scrollTrigger: { trigger: ".scene--little", start: "top 75%", end: "74% 30%", scrub: 0.9 },
          })
            .fromTo(".little-heading", { y: 45, opacity: 0 }, { y: 0, opacity: 1, ease: "none" }, 0)
            .fromTo(".keepsake--1", { x: "-22vw", y: "14vh", rotate: -18, opacity: 0.18 }, { x: 0, y: 0, rotate: -7, opacity: 1, ease: "none" }, 0.04)
            .fromTo(".keepsake--2", { x: "22vw", y: "8vh", rotate: 16, opacity: 0.14 }, { x: 0, y: 0, rotate: 5, opacity: 1, ease: "none" }, 0.08)
            .fromTo(".keepsake--3", { x: "-19vw", y: "24vh", rotate: -14, opacity: 0.12 }, { x: 0, y: 0, rotate: -2, opacity: 1, ease: "none" }, 0.12)
            .fromTo(".keepsake--4", { x: "22vw", y: "24vh", rotate: 17, opacity: 0.1 }, { x: 0, y: 0, rotate: 7, opacity: 1, ease: "none" }, 0.16)
            .fromTo(".keepsake--5", { y: "32vh", rotate: -11, opacity: 0.1 }, { y: 0, rotate: -4, opacity: 1, ease: "none" }, 0.2)
            .fromTo(".pocket", { opacity: 0, y: 22 }, { opacity: 1, y: 0, ease: "none" }, 0.56);

          gsap.timeline({
            scrollTrigger: { trigger: ".scene--waiting", start: "top top", end: "bottom bottom", scrub: 1 },
          })
            .fromTo(".waiting-image", { scale: 1.12, xPercent: -2 }, { scale: 1.015, xPercent: 1.5, ease: "none" }, 0)
            .to(".waiting-rain", { opacity: 0.9, ease: "none" }, 0.08)
            .fromTo(".waiting-clock", { scale: 0.78, letterSpacing: "-.08em", opacity: 0.04 }, { scale: 1.18, letterSpacing: ".08em", opacity: 0.14, ease: "none" }, 0.04)
            .fromTo(".waiting-echoes span", { x: 0, opacity: 0 }, { x: (index) => (index + 1) * (mobile ? 18 : 42), opacity: 0.18, stagger: 0.1, ease: "none" }, 0.28)
            .fromTo(".waiting-copy", { y: 28, opacity: 0.48 }, { y: mobile ? -24 : -62, opacity: 1, ease: "none" }, 0.02)
            .fromTo(".phone-check", { y: mobile ? 28 : 60, opacity: 0, rotate: 3 }, { y: 0, opacity: 1, rotate: -1, ease: "none" }, mobile ? 0.28 : 0.38)
            .fromTo(".waiting-aside", { opacity: 0 }, { opacity: 0.78, ease: "none" }, 0.62);

          gsap.timeline({
            scrollTrigger: { trigger: ".scene--almost", start: "top 84%", end: "bottom 18%", scrub: 0.9 },
          })
            .fromTo(".almost-copy", { y: mobile ? 42 : 68, opacity: 0 }, { y: 0, opacity: 1, ease: "none" }, 0)
            .fromTo(".almost-note", { y: mobile ? 32 : 44, rotate: 7, scale: 0.94, opacity: 0 }, { y: 0, rotate: -2, scale: 1, opacity: 1, ease: "none" }, 0.08)
            .fromTo(".almost-result", { y: 10 }, { y: 0, ease: "none" }, 0.16);

          gsap.timeline({
            scrollTrigger: { trigger: ".scene--unsent", start: "top 80%", end: "bottom 18%", scrub: 0.95 },
          })
            .fromTo(".unsent-copy", { x: mobile ? -30 : -85, opacity: 0 }, { x: 0, opacity: 1, ease: "none" }, 0)
            .fromTo(".draft-paper", { x: mobile ? "40vw" : "30vw", y: 90, rotate: 10, opacity: 0 }, { x: 0, y: mobile ? 0 : -30, rotate: -2, opacity: 1, ease: "none" }, 0.1)
            .fromTo(".unsent-result", { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: "none" }, 0.6);

          const memoryTimeline = gsap.timeline({
            scrollTrigger: { trigger: ".scene--memories", start: "top top", end: "bottom bottom", scrub: 1.05 },
          });
          memoryTimeline
            .fromTo(".memories-image", { scale: 1.14 }, { scale: 1.02, xPercent: 2.5, ease: "none" }, 0)
            .to(".memories-copy", { y: mobile ? -48 : -86, opacity: 0.32, ease: "none" }, 0.2)
            .fromTo(".memory-bloom", { xPercent: 30, yPercent: 32, rotate: 18, scale: 0.68, opacity: 0 }, { xPercent: mobile ? -8 : -26, yPercent: -18, rotate: -14, scale: mobile ? 1.05 : 1.3, opacity: 0.86, ease: "none" }, 0.2)
            .fromTo(".film-strip", { x: mobile ? "78vw" : "62vw" }, { x: mobile ? "-360vw" : "-112vw", ease: "none" }, 0.05)
            .fromTo(".memories-footnote", { opacity: 0, y: 22 }, { opacity: 1, y: 0, ease: "none" }, 0.56)
            .to(".memories-copy", { opacity: 0.08, ease: "none" }, 0.64)
            .to(".film-strip", { opacity: 0.055, scale: 0.9, ease: "none" }, 0.68)
            .to(".memory-bloom", { opacity: 0.16, scale: mobile ? 0.82 : 0.9, ease: "none" }, 0.7)
            .fromTo(".memory-collapse", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, ease: "none" }, 0.68)
            .fromTo(".memory-collapse-card--1", { x: mobile ? -185 : -460, y: mobile ? -150 : -190, rotate: -14, scale: 0.72, opacity: 0 }, { x: mobile ? -84 : -270, y: mobile ? -106 : -148, rotate: -8, scale: 0.86, opacity: 0.72, ease: "none" }, 0.69)
            .fromTo(".memory-collapse-card--2", { x: mobile ? 180 : 450, y: mobile ? -170 : -215, rotate: 13, scale: 0.7, opacity: 0 }, { x: mobile ? 84 : 276, y: mobile ? -96 : -136, rotate: 7, scale: 0.82, opacity: 0.66, ease: "none" }, 0.71)
            .fromTo(".memory-collapse-card--3", { x: mobile ? -180 : -430, y: mobile ? 155 : 205, rotate: 11, scale: 0.72, opacity: 0 }, { x: mobile ? -86 : -252, y: mobile ? 96 : 142, rotate: 5, scale: 0.8, opacity: 0.62, ease: "none" }, 0.73)
            .fromTo(".memory-collapse-card--4", { x: mobile ? 184 : 440, y: mobile ? 168 : 220, rotate: -12, scale: 0.68, opacity: 0 }, { x: mobile ? 86 : 260, y: mobile ? 102 : 150, rotate: -6, scale: 0.78, opacity: 0.58, ease: "none" }, 0.75)
            .fromTo(".memory-collapse-card--5", { y: mobile ? 150 : 190, rotate: -3, scale: 0.72, opacity: 0 }, { y: 0, rotate: 0, scale: mobile ? 1.02 : 1.12, opacity: 1, ease: "none" }, 0.72)
            .to(".memory-collapse-card:not(.memory-collapse-card--5)", { x: 0, y: 0, scale: 0.66, opacity: 0.1, rotate: 0, ease: "none" }, 0.86)
            .to(".memory-collapse-card--5", { scale: mobile ? 1.2 : 1.46, ease: "none" }, 0.86)
            .fromTo(".memory-collapse > p", { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: "none" }, 0.88)
            .to(".memories-footnote", { opacity: 0, ease: "none" }, 0.78);

          gsap.timeline({
            scrollTrigger: { trigger: ".scene--distance", start: "top top", end: "bottom bottom", scrub: 1 },
          })
            .fromTo(".distance-half--you", { clipPath: "inset(0 48% 0 0)" }, { clipPath: "inset(0 55% 0 0)", ease: "none" }, 0)
            .fromTo(".distance-half--them", { clipPath: "inset(0 0 0 48%)" }, { clipPath: "inset(0 0 0 55%)", ease: "none" }, 0)
            .fromTo(".distance-giants span:first-child", { x: 0 }, { x: mobile ? -22 : -74, ease: "none" }, 0.08)
            .fromTo(".distance-giants span:last-child", { x: 0 }, { x: mobile ? 22 : 74, ease: "none" }, 0.08)
            .to(".distance-copy", { x: mobile ? -18 : -64, opacity: 0.55, ease: "none" }, 0.25)
            .fromTo(".distance-pull", { opacity: 0, y: 35 }, { opacity: 1, y: 0, ease: "none" }, 0.36)
            .fromTo(".distance-check", { opacity: 0, y: 28 }, { opacity: 1, y: 0, ease: "none" }, 0.58);

          gsap.timeline({
            scrollTrigger: { trigger: ".scene--trying", start: "top 78%", end: "76% 28%", scrub: 0.9 },
          })
            .fromTo(".trying-copy", { y: 52, opacity: 0 }, { y: 0, opacity: 1, ease: "none" }, 0)
            .fromTo(".loss-object--1", { x: "-42vw", rotate: -26, opacity: 0 }, { x: 0, rotate: -8, opacity: 1, ease: "none" }, 0.08)
            .fromTo(".loss-object--2", { x: "42vw", rotate: 25, opacity: 0 }, { x: 0, rotate: 7, opacity: 1, ease: "none" }, 0.14)
            .fromTo(".loss-object--3", { y: "50vh", rotate: -20, opacity: 0 }, { y: 0, rotate: 3, opacity: 1, ease: "none" }, 0.2)
            .fromTo(".loss-object--4", { y: "45vh", rotate: 19, opacity: 0 }, { y: 0, rotate: -2, opacity: 1, ease: "none" }, 0.26)
            .fromTo(".trying-answer", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.56)
            .to(".loss-object > span, .loss-object > strong, .trying-answer", { opacity: 0, y: -8, ease: "none" }, 0.84);

          const returnNames = ["flower", "photo", "message", "ticket", "date", "note"];
          const returnTimeline = gsap.timeline({
            scrollTrigger: { trigger: ".scene--nothing", start: "top top", end: "bottom bottom", scrub: 1.05 },
          });
          returnTimeline
            .fromTo(".nothing-image", { scale: 1.2, filter: "brightness(.16) saturate(.5)" }, { scale: 1.02, filter: "brightness(.58) saturate(.78)", ease: "none" }, 0)
            .fromTo(".memory-storm", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.15)
            .fromTo(".nothing-word", { scale: 0.66, rotate: -7, opacity: 0 }, { scale: 1.12, rotate: 2, opacity: 0.16, ease: "none" }, 0.06)
            .fromTo(".nothing-copy", { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, ease: "none" }, 0.08)
            .fromTo(".nothing-thread i", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0.16);
          returnNames.forEach((name, index) => {
            returnTimeline.fromTo(
              `.return-piece--${name}`,
              { opacity: 0, x: index % 2 ? "48vw" : "-48vw", y: index % 3 === 0 ? "26vh" : "-24vh", rotate: index % 2 ? 20 : -20, scale: 0.7 },
              { opacity: 1, x: 0, y: 0, rotate: [-7, 6, -2, 4, -8, 3][index], scale: 1, ease: "none" },
              0.26 + index * 0.065,
            );
          });

          gsap.timeline({
            scrollTrigger: { trigger: ".scene--love", start: "top 82%", end: "center 43%", scrub: 0.95 },
          })
            .fromTo(".love-image", { scale: 1.08, opacity: 0.52 }, { scale: 1, opacity: 1, ease: "none" }, 0)
            .fromTo(".love-final-word", { xPercent: 18, opacity: 0 }, { xPercent: -3, opacity: 0.11, ease: "none" }, 0.02)
            .fromTo(".love-copy > *", { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.11, ease: "none" }, 0.08)
            .fromTo(".final-letter", { y: mobile ? 90 : 160, x: mobile ? 0 : 110, rotate: 8, scale: 0.84, opacity: 0 }, { y: 0, x: 0, rotate: -2, scale: 1, opacity: 1, ease: "none" }, 0.27);
        },
      );

      return () => media.revert();
    }, root);

    return () => {
      context.revert();
      lenis.destroy();
      delete root.dataset.scrollDirection;
      cancelAnimationFrame(rafId);
    };
  }, [rootRef]);
}

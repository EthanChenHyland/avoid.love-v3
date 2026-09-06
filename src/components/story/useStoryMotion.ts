import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { StoryRefs } from "./types";

export default function useStoryMotion(refs: StoryRefs) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.02,
      smoothWheel: true,
      wheelMultiplier: 0.94,
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

      media.add(
        {
          mobile: "(max-width: 700px)",
          desktop: "(min-width: 701px)",
        },
        (match) => {
          const mobile = Boolean(match.conditions?.mobile);

          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .from(".before-story__image", { scale: 1.08, duration: 1.55 })
            .from(".before-story__lockup > *", { y: mobile ? 18 : 32, opacity: 0, stagger: 0.12, duration: 0.85 }, 0.12)
            .from(".before-story__promise", { opacity: 0, y: 18, duration: 0.8 }, 0.52)
            .from(".before-story__second-place", { opacity: 0, x: 28, duration: 0.9 }, 0.7)
            .to(".before-story__curtain", { xPercent: 42, duration: 1.2, ease: "power4.inOut" }, 0.2)
            .from(".before-story__scroll", { opacity: 0, y: -10, duration: 0.7 }, 0.95);

          if (refs.before.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: refs.before.current,
                start: "top top",
                end: "bottom top",
                scrub: 0.9,
              },
            })
              .to(".before-story__curtain", { xPercent: 118, ease: "none" }, 0)
              .to(".before-story__image", { scale: 1.015, yPercent: 3, ease: "none" }, 0)
              .to(".before-story__lockup", { y: mobile ? -40 : -76, opacity: 0.25, ease: "none" }, 0.24)
              .to(".before-story__promise", { y: -20, opacity: 0, ease: "none" }, 0.4);
          }

          if (refs.notice.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: refs.notice.current,
                start: "top 78%",
                end: "bottom 22%",
                scrub: 0.85,
              },
            })
              .fromTo(".notice-story__photo", { clipPath: "inset(0 100% 0 0)", scale: 0.96 }, { clipPath: "inset(0 0% 0 0)", scale: 1, ease: "none" }, 0)
              .fromTo(".notice-story__copy", { y: mobile ? 36 : 70, opacity: 0.1 }, { y: mobile ? -10 : -34, opacity: 1, ease: "none" }, 0.05)
              .fromTo(".notice-story__details span", { opacity: 0, x: 22 }, { opacity: 1, x: 0, stagger: 0.12, ease: "none" }, 0.35);
          }

          if (refs.littleThings.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: refs.littleThings.current,
                start: "top 76%",
                end: "70% 35%",
                scrub: 0.72,
              },
            })
              .fromTo(".little-things-story__heading", { opacity: 0, y: 42 }, { opacity: 1, y: 0, ease: "none" }, 0)
              .fromTo(".keepsake", { opacity: 0 }, { opacity: 1, stagger: 0.09, ease: "none" }, 0.17);
          }

          if (refs.waiting.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: refs.waiting.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
              },
            })
              .fromTo(".waiting-story__image", { scale: 1.08, xPercent: -1 }, { scale: 1.015, xPercent: 1.5, ease: "none" }, 0)
              .fromTo(".waiting-story__copy", { y: 20, opacity: 0.55 }, { y: mobile ? -28 : -58, opacity: 1, ease: "none" }, 0)
              .fromTo(".waiting-check", { opacity: 0, y: 26 }, { opacity: 1, y: 0, ease: "none" }, 0.34)
              .to(".waiting-story__rain", { opacity: 0.92, ease: "none" }, 0.15);
          }

          if (refs.unsent.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: refs.unsent.current,
                start: "top 76%",
                end: "bottom 24%",
                scrub: 0.9,
              },
            })
              .fromTo(".unsent-story__heading", { opacity: 0, x: mobile ? -18 : -54 }, { opacity: 1, x: 0, ease: "none" }, 0)
              .fromTo(".unsent-paper", { y: mobile ? 80 : 150, rotate: 7, scale: 0.9, opacity: 0 }, { y: mobile ? -10 : -34, rotate: -2, scale: 1, opacity: 1, ease: "none" }, 0.08)
              .fromTo(".unsent-story__residue", { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "none" }, 0.58);
          }

          if (refs.memory.current) {
            const cardX = mobile ? ["-34vw", "22vw", "-18vw", "28vw"] : ["-29vw", "-8vw", "12vw", "30vw"];
            const cardY = mobile ? ["19vh", "30vh", "45vh", "57vh"] : ["18vh", "27vh", "35vh", "47vh"];

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: refs.memory.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.05,
              },
            });

            timeline
              .fromTo(".memory-story__image", { scale: 1.13 }, { scale: 1.02, xPercent: mobile ? 6 : 3, ease: "none" }, 0)
              .fromTo(".memory-story__copy", { opacity: 0.9, y: 0 }, { opacity: 0.48, y: mobile ? -34 : -70, ease: "none" }, 0.22);

            [1, 2, 3, 4].forEach((index) => {
              timeline.fromTo(
                `.memory-card--${index}`,
                { opacity: 0, x: 0, y: "66vh", rotate: index % 2 ? -14 : 13, scale: 0.82 },
                { opacity: 1, x: cardX[index - 1], y: cardY[index - 1], rotate: [-8, 5, -4, 8][index - 1], scale: 1, ease: "none" },
                0.12 + index * 0.09,
              );
            });
          }

          if (refs.distance.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: refs.distance.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.08,
              },
            })
              .fromTo(".distance-story__image", { scale: 1.08 }, { scale: 1.015, xPercent: 1.7, ease: "none" }, 0)
              .fromTo(".distance-story__copy", { opacity: 1, x: 0 }, { opacity: 0.6, x: mobile ? -10 : -48, ease: "none" }, 0.18)
              .fromTo(".distance-checkpoint", { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "none" }, 0.44)
              .to(".story-thread", { scaleX: 1.16, opacity: 0.42, transformOrigin: "50% 50%", ease: "none" }, 0.2);
          }

          if (refs.trying.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: refs.trying.current,
                start: "top 75%",
                end: "75% 32%",
                scrub: 0.82,
              },
            })
              .fromTo(".trying-story__copy", { opacity: 0, y: 34 }, { opacity: 1, y: 0, ease: "none" }, 0)
              .fromTo(".trying-object--letter", { x: "-40vw", rotate: -24, opacity: 0 }, { x: 0, rotate: -7, opacity: 1, ease: "none" }, 0.14)
              .fromTo(".trying-object--photo", { x: "40vw", rotate: 21, opacity: 0 }, { x: 0, rotate: 6, opacity: 1, ease: "none" }, 0.2)
              .fromTo(".trying-object--flower", { y: "55vh", rotate: 35, opacity: 0 }, { y: 0, rotate: -4, opacity: 1, ease: "none" }, 0.26)
              .fromTo(".trying-object--thread", { y: "45vh", scale: 0.7, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: "none" }, 0.32)
              .fromTo(".trying-story__response", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.62);
          }

          if (refs.impossible.current) {
            const returning = ["photo", "flower", "message", "receipt", "date", "note"];
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: refs.impossible.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
              },
            });

            timeline
              .fromTo(".impossible-story__image", { scale: 1.18, filter: "brightness(.16) saturate(.55)" }, { scale: 1.02, filter: "brightness(.66) saturate(.86)", ease: "none" }, 0)
              .fromTo(".impossible-story__copy", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, ease: "none" }, 0.08);

            returning.forEach((name, index) => {
              timeline.fromTo(
                `.returning-memory--${name}`,
                {
                  opacity: 0,
                  x: index % 2 ? "44vw" : "-44vw",
                  y: index % 3 === 0 ? "32vh" : "-28vh",
                  rotate: index % 2 ? 18 : -18,
                  scale: 0.72,
                },
                { opacity: 1, x: 0, y: 0, rotate: [-6, 7, -2, 5, -8, 3][index], scale: 1, ease: "none" },
                0.23 + index * 0.07,
              );
            });
          }

          if (refs.love.current) {
            gsap.timeline({
              scrollTrigger: {
                trigger: refs.love.current,
                start: "top 78%",
                end: "center 44%",
                scrub: 0.9,
              },
            })
              .fromTo(".love-story__image", { scale: 1.08, opacity: 0.42 }, { scale: 1, opacity: 1, ease: "none" }, 0)
              .fromTo(".love-story__copy > *", { opacity: 0, y: 26 }, { opacity: 1, y: 0, stagger: 0.12, ease: "none" }, 0.08)
              .fromTo(".love-letter", { opacity: 0, y: mobile ? 80 : 130, rotate: 9 }, { opacity: 1, y: 0, rotate: -2, ease: "none" }, 0.26);
          }

          const travel = (trigger: HTMLElement | null, selector: string, vars: gsap.TweenVars) => {
            if (!trigger) return;
            gsap.to(selector, {
              ...vars,
              scrollTrigger: {
                trigger,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            });
          };

          travel(refs.notice.current, ".story-flower", { opacity: 0.9, x: mobile ? "-8vw" : "-16vw", y: "8vh", rotate: -8, scale: 0.9 });
          travel(refs.notice.current, ".story-letter", { opacity: 0.72, x: mobile ? "-20vw" : "-28vw", y: "15vh", rotate: -6, scale: 0.82 });
          travel(refs.littleThings.current, ".story-photo", { opacity: 0.76, x: mobile ? "14vw" : "24vw", y: "-8vh", rotate: 7, scale: 0.84 });
          travel(refs.waiting.current, ".story-flower", { opacity: 0.24, y: "36vh", rotate: 24, scale: 0.54 });
          travel(refs.unsent.current, ".story-letter", { opacity: 0.9, x: mobile ? "-38vw" : "-48vw", y: "-7vh", rotate: 2, scale: 0.88 });
          travel(refs.memory.current, ".story-photo", { opacity: 0.9, x: mobile ? "-18vw" : "-26vw", y: "10vh", rotate: -5, scale: 0.96 });
          travel(refs.distance.current, ".story-photo", { opacity: 0.14, x: mobile ? "38vw" : "47vw", y: "22vh", scale: 0.62 });
          travel(refs.distance.current, ".story-letter", { opacity: 0.15, x: mobile ? "31vw" : "42vw", y: "28vh", scale: 0.64 });
          travel(refs.trying.current, ".story-flower", { opacity: 0.78, x: mobile ? "-22vw" : "-35vw", y: "2vh", rotate: -26, scale: 0.76 });
          travel(refs.impossible.current, ".story-flower", { opacity: 1, x: mobile ? "4vw" : "7vw", y: "-20vh", rotate: 5, scale: 1 });
          travel(refs.impossible.current, ".story-letter", { opacity: 0.92, x: mobile ? "6vw" : "12vw", y: "-16vh", rotate: -2, scale: 0.96 });
          travel(refs.impossible.current, ".story-photo", { opacity: 0.88, x: mobile ? "-8vw" : "-14vw", y: "-19vh", rotate: 4, scale: 0.94 });
        },
      );

      return () => media.revert();
    }, refs.root);

    return () => {
      context.revert();
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, [refs]);
}

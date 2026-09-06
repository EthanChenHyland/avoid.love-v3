import type { RefObject } from "react";

export type StoryRefs = {
  root: RefObject<HTMLElement | null>;
  before: RefObject<HTMLElement | null>;
  notice: RefObject<HTMLElement | null>;
  littleThings: RefObject<HTMLElement | null>;
  waiting: RefObject<HTMLElement | null>;
  unsent: RefObject<HTMLElement | null>;
  memory: RefObject<HTMLElement | null>;
  distance: RefObject<HTMLElement | null>;
  trying: RefObject<HTMLElement | null>;
  impossible: RefObject<HTMLElement | null>;
  love: RefObject<HTMLElement | null>;
};

export type SuppressionKey = "letter" | "photo" | "flower" | "thread";

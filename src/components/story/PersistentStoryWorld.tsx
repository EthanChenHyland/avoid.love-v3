type PersistentStoryWorldProps = {
  attempts: number;
  accepted: boolean;
};

export default function PersistentStoryWorld({ attempts, accepted }: PersistentStoryWorldProps) {
  return (
    <div className={`story-world ${attempts ? "story-world--resisting" : ""} ${accepted ? "story-world--accepted" : ""}`} aria-hidden="true">
      <svg className="story-thread" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <path d="M-120 540 C 180 430, 345 625, 585 505 S 955 405, 1170 520 S 1450 590, 1720 430" />
      </svg>

      <div className="story-letter">
        <span className="story-letter__fold" />
        <span className="story-letter__ink">this reminded me of you</span>
      </div>

      <div className="story-flower">
        <i className="story-flower__petal story-flower__petal--one" />
        <i className="story-flower__petal story-flower__petal--two" />
        <i className="story-flower__petal story-flower__petal--three" />
        <i className="story-flower__petal story-flower__petal--four" />
        <i className="story-flower__center" />
        <i className="story-flower__stem" />
      </div>

      <div className="story-photo">
        <span />
        <i>the eleventh</i>
      </div>
    </div>
  );
}

import { memo } from "react";
import Eyebrow from "./Eyebrow";

const SectionHeading = memo(function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  className = "",
  titleAs: TitleTag = "h2",
  id,
}) {
  return (
    <div className={`flex flex-col gap-3 w-full ${className}`.trim()}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <TitleTag
            id={id}
            className="font-headline-md text-2xl md:text-3xl  border-b-4 border-outline pb-2 w-fit"
          >
            {title}
          </TitleTag>
        </div>
        {actions ? <div className="shrink-0 flex items-center gap-3">{actions}</div> : null}
      </div>
      {description ? (
        <p className="font-body-md text-base md:text-lg text-on-surface max-w-2xl leading-snug">
          {description}
        </p>
      ) : null}
    </div>
  );
});

export default SectionHeading;

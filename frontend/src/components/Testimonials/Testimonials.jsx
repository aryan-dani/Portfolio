import { memo } from "react";
import { TESTIMONIALS } from "../../data/testimonials";

const Testimonials = memo(function Testimonials() {
  if (!TESTIMONIALS.length) return null;

  return (
    <section aria-labelledby="testimonials-heading" className="flex flex-col gap-4 w-full">
      <h2 id="testimonials-heading" className="font-headline-md text-xl ">
        Client notes
      </h2>
      <ul className="flex flex-col gap-3">
        {TESTIMONIALS.map((entry) => (
          <li
            key={entry.id || entry.quote}
            className="border-4 border-outline bg-surface p-4 shadow-[4px_4px_0_0_var(--shadow-color)]"
          >
            <blockquote className="font-body-md text-sm leading-snug">{entry.quote}</blockquote>
            {entry.attribution ? (
              <p className="font-label-bold text-xs  mt-2">{entry.attribution}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
});

export default Testimonials;
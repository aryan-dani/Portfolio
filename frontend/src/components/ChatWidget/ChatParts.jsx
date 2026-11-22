import { memo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import KuroMarkdown, { safePartialMarkdown } from "./KuroMarkdown";
import { KuroFace } from "./KuroFace";

const SPRING = { type: "spring", stiffness: 420, damping: 30 };
const chipBase =
  "border-2 border-outline px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide shadow-[2px_2px_0_var(--shadow-color)] transition-[background-color,color,box-shadow,transform] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0_var(--shadow-color)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-surface";

/* ---------------------------------------------------------------- typing */

/** Three bouncing squares. Static under reduced motion. */
export function TypingIndicator({ policy, label }) {
  const animated = policy !== "reduced";
  return (
    <div className="flex flex-col items-start gap-1" role="status">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted px-0.5">Kuro</span>
      <div className="inline-flex items-center gap-2 border-2 border-outline bg-surface-variant px-3 py-3 shadow-[3px_3px_0_var(--shadow-color)]">
        {label && <span className="font-mono text-xs text-text-muted">{label}</span>}
        <span className="inline-flex items-end gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-2 w-2 bg-on-surface"
              animate={animated ? { y: [0, -6, 0] } : undefined}
              transition={animated ? { duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" } : undefined}
            />
          ))}
        </span>
        <span className="sr-only">Kuro is typing</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- streaming */

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/** Character-by-character reveal for model replies. Full text is exposed to screen readers at once. */
function StreamedMarkdown({ text, animate, onDone, onNavigate }) {
  const [shown, setShown] = useState(animate ? 0 : text.length);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!animate) return undefined;
    const total = Math.min(1800, Math.max(450, text.length * 12));
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / total);
      setShown(Math.round(easeOutCubic(t) * text.length));
      if (t < 1) raf = requestAnimationFrame(tick);
      else doneRef.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, text]);

  const streaming = animate && shown < text.length;
  if (!streaming) return <KuroMarkdown text={text} onNavigate={onNavigate} />;
  return (
    <>
      <span className="sr-only">{text}</span>
      <div aria-hidden="true">
        <KuroMarkdown text={safePartialMarkdown(text.slice(0, shown))} onNavigate={onNavigate} />
        <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-on-surface" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ cards */

function CardButton({ children, onClick, href, primary = false }) {
  const cls = `border-2 border-outline px-2 py-1 font-mono text-[9px] uppercase tracking-wide transition-[background-color,color,transform] hover:translate-x-px hover:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-surface ${
    primary ? "bg-primary-container text-on-primary-container" : "bg-surface text-on-surface hover:bg-surface-variant"
  }`;
  if (href) {
    return (
      <button type="button" className={cls} onClick={() => onClick?.(href)}>
        {children}
      </button>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

const ProjectCard = memo(function ProjectCard({ card, onNavigate, onOpenUrl }) {
  return (
    <article className="w-full max-w-[92%] overflow-hidden border-2 border-outline bg-surface text-on-surface shadow-[3px_3px_0_var(--shadow-color)]">
      {card.image && (
        <img
          src={card.image}
          alt={card.imageAlt || `${card.title} screenshot`}
          width="360"
          height="160"
          loading="lazy"
          decoding="async"
          className="h-24 w-full border-b-2 border-outline object-cover object-top"
        />
      )}
      <div className="space-y-2 p-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-label-bold text-xs uppercase tracking-[0.1em]">{card.title}</h3>
          <span className="shrink-0 font-mono text-[9px] text-text-muted">{card.year}</span>
        </div>
        {card.blurb && <p className="line-clamp-2 text-xs leading-snug text-text-muted">{card.blurb}</p>}
        {card.tags?.length > 0 && (
          <ul className="flex flex-wrap gap-1" aria-label="Tags">
            {card.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="border border-outline px-1.5 py-0.5 font-mono text-[9px] uppercase">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-1.5">
          <CardButton primary onClick={() => onNavigate(card.path)}>
            Open card
          </CardButton>
          {card.caseStudyPath && <CardButton onClick={() => onNavigate(card.caseStudyPath)}>Case study</CardButton>}
          {card.live && (
            <CardButton href={card.live} onClick={(url) => onOpenUrl(url, `${card.title} demo`)}>
              Live
            </CardButton>
          )}
          {card.github && (
            <CardButton href={card.github} onClick={(url) => onOpenUrl(url, `${card.title} code`)}>
              GitHub
            </CardButton>
          )}
        </div>
      </div>
    </article>
  );
});

const PackageCard = memo(function PackageCard({ card, onNavigate }) {
  return (
    <article className="w-full max-w-[92%] border-2 border-outline bg-surface text-on-surface shadow-[3px_3px_0_var(--shadow-color)]">
      <div className="border-b-2 border-outline bg-primary-container px-2.5 py-1.5 text-on-primary-container">
        <h3 className="font-label-bold text-xs uppercase tracking-[0.1em]">{card.name}</h3>
      </div>
      <div className="space-y-1.5 p-2.5">
        <p className="font-mono text-[11px] leading-snug">{card.price}</p>
        <p className="font-mono text-[9px] uppercase tracking-wide text-text-muted">{card.timeline}</p>
        {card.forWho && <p className="text-xs leading-snug text-text-muted">{card.forWho}</p>}
        <CardButton primary onClick={() => onNavigate(card.path)}>
          Start a project
        </CardButton>
      </div>
    </article>
  );
});

export function CardList({ cards, policy, onNavigate, onOpenUrl }) {
  if (!cards?.length) return null;
  const full = policy === "full";
  return (
    <div className="flex w-full flex-col items-start gap-2">
      {cards.map((card, i) => (
        <motion.div
          key={`${card.type}-${card.id}`}
          className="w-full"
          initial={policy === "reduced" ? false : { opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING, delay: full ? 0.12 + i * 0.08 : 0 }}
        >
          {card.type === "package" ? (
            <PackageCard card={card} onNavigate={onNavigate} />
          ) : (
            <ProjectCard card={card} onNavigate={onNavigate} onOpenUrl={onOpenUrl} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ chips */

/** Quick replies that spring in one by one. */
export function ChipRow({ chips, policy, onChip, baseDelay = 0.1, className = "" }) {
  if (!chips?.length) return null;
  const staggered = policy !== "reduced";
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label="Quick replies">
      {chips.map((chip, i) => (
        <motion.button
          key={`${chip.label}-${i}`}
          type="button"
          onClick={() => onChip(chip)}
          initial={staggered ? { opacity: 0, y: 8, scale: 0.92 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 30, delay: staggered ? baseDelay + i * 0.06 : 0 }}
          className={`${chipBase} ${
            chip.ai
              ? "border-dashed bg-surface-variant text-text-muted hover:bg-on-surface hover:text-surface"
              : "bg-surface text-on-surface hover:bg-primary-container hover:text-on-primary-container"
          }`}
        >
          {chip.label}
        </motion.button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- bubbles */

export const MessageBubble = memo(function MessageBubble({
  message,
  index,
  isLast,
  initialMount,
  policy,
  onNavigate,
  onOpenUrl,
  onChip,
  onStreamDone,
}) {
  const isUser = message.role === "user";
  const staggerDelay = policy === "full" && initialMount ? Math.min(index, 6) * 0.04 : 0;
  return (
    <motion.div
      className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
      initial={policy === "reduced" ? false : { opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 28, delay: staggerDelay }}
      style={{ transformOrigin: isUser ? "100% 100%" : "0% 100%" }}
    >
      <span className="px-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
        {isUser ? "You" : "Kuro"}
      </span>
      <div
        className={`max-w-[92%] border-2 border-outline px-3 py-2.5 leading-snug shadow-[3px_3px_0_var(--shadow-color)] ${
          isUser ? "bg-on-background text-background" : "bg-surface-variant text-on-surface"
        }`}
      >
        {isUser ? (
          message.text
        ) : (
          <StreamedMarkdown
            text={message.text}
            animate={Boolean(message.stream) && policy !== "reduced"}
            onDone={() => onStreamDone?.(message.id)}
            onNavigate={onNavigate}
          />
        )}
      </div>
      {message.actionLabel && (
        <p className="px-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted">{message.actionLabel}</p>
      )}
      {!isUser && <CardList cards={message.cards} policy={policy} onNavigate={onNavigate} onOpenUrl={onOpenUrl} />}
      {!isUser && isLast && !message.stream && (
        <ChipRow chips={message.chips} policy={policy} onChip={onChip} baseDelay={message.cards?.length ? 0.35 : 0.12} />
      )}
    </motion.div>
  );
});

/* ------------------------------------------------------------ empty state */

export function EmptyState({ welcome, chips, policy, crtMode, onChip }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3.5 px-1 py-3 text-center">
      <motion.div
        className="border-2 border-outline bg-surface-variant p-1.5 shadow-[4px_4px_0_var(--shadow-color)]"
        initial={policy === "reduced" ? false : { opacity: 0, scale: 0.8, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 20 }}
      >
        <KuroFace pupilsRef={null} mood="excited" bliss={false} sleeping={false} robot={crtMode} size={56} />
      </motion.div>
      <div className="space-y-1.5">
        <h3 className="font-label-bold text-sm uppercase tracking-[0.16em]">Ask Kuro</h3>
        <p className="mx-auto max-w-[17rem] text-sm leading-snug text-on-surface">{welcome}</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
          Instant answers from Aryan&apos;s real data
        </p>
      </div>
      <ChipRow chips={chips} policy={policy} onChip={onChip} baseDelay={0.2} className="justify-center" />
    </div>
  );
}

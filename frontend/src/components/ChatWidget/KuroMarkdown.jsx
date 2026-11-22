import { Fragment, memo } from "react";
import { isProjectPreviewUrl, openSiteBrowser } from "../../utils/siteBrowser";

/**
 * Lightweight Kuro markdown: **bold**, `code`, [label](url), "- " bullets, "1. " steps, newlines.
 * No dependency; falls back to plain text on odd input. Internal links (/path) use `onNavigate`.
 */
function tokenize(text) {
  const src = String(text ?? "");
  const tokens = [];
  const re = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let match;
  while ((match = re.exec(src)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: src.slice(last, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith("**")) {
      tokens.push({ type: "bold", value: raw.slice(2, -2) });
    } else if (raw.startsWith("`")) {
      tokens.push({ type: "code", value: raw.slice(1, -1) });
    } else {
      const linkMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        tokens.push({ type: "link", value: linkMatch[1], href: linkMatch[2] });
      } else {
        tokens.push({ type: "text", value: raw });
      }
    }
    last = match.index + raw.length;
  }
  if (last < src.length) {
    tokens.push({ type: "text", value: src.slice(last) });
  }
  return tokens.length ? tokens : [{ type: "text", value: src }];
}

function renderInline(text, keyPrefix, onNavigate) {
  return tokenize(text).map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    if (token.type === "bold") {
      return (
        <strong key={key} className="font-label-bold">
          {token.value}
        </strong>
      );
    }
    if (token.type === "code") {
      return (
        <code
          key={key}
          className="font-mono text-[0.85em] border border-outline bg-surface px-1 py-0.5"
        >
          {token.value}
        </code>
      );
    }
    if (token.type === "link") {
      const internal = token.href.startsWith("/");
      const mailto = token.href.startsWith("mailto:");
      return (
        <a
          key={key}
          href={token.href}
          {...(internal || mailto ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          className="underline decoration-2 underline-offset-2 font-label-bold hover:bg-on-surface hover:text-surface transition-colors"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (internal && onNavigate) {
              event.preventDefault();
              onNavigate(token.href);
              return;
            }
            if (!isProjectPreviewUrl(token.href)) return;
            event.preventDefault();
            openSiteBrowser({ url: token.href, title: token.value });
          }}
        >
          {token.value}
        </a>
      );
    }
    return <Fragment key={key}>{token.value}</Fragment>;
  });
}

/** Group lines into paragraphs, bullet lists and numbered lists. */
function toBlocks(text) {
  const blocks = [];
  for (const line of String(text ?? "").split("\n")) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const step = line.match(/^\s*(\d+)\.\s+(.*)$/);
    const kind = bullet ? "ul" : step ? "ol" : "p";
    const body = bullet ? bullet[1] : step ? step[2] : line;
    const prev = blocks[blocks.length - 1];
    if (kind !== "p" && prev?.kind === kind) {
      prev.items.push({ body, n: step ? step[1] : null });
    } else {
      blocks.push({ kind, items: [{ body, n: step ? step[1] : null }] });
    }
  }
  return blocks;
}

export const KuroMarkdown = memo(function KuroMarkdown({ text, className = "", onNavigate }) {
  const blocks = toBlocks(text);
  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const spacing = bi > 0 ? "mt-2" : undefined;
        if (block.kind === "p") {
          return (
            <p key={bi} className={spacing}>
              {renderInline(block.items[0].body, `b${bi}`, onNavigate)}
            </p>
          );
        }
        return (
          <ul key={bi} className={`${spacing ?? ""} space-y-1`.trim()}>
            {block.items.map((item, ii) => (
              <li key={ii} className="flex items-start gap-2">
                {block.kind === "ul" ? (
                  <span className="mt-[0.5em] h-1.5 w-1.5 shrink-0 bg-on-surface" aria-hidden="true" />
                ) : (
                  <span className="shrink-0 font-mono text-[0.8em] leading-[1.6] text-text-muted">{item.n}.</span>
                )}
                <span className="min-w-0">{renderInline(item.body, `b${bi}-${ii}`, onNavigate)}</span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
});

/**
 * Cut streamed text at a safe point so half-open markdown (`**bo`, `[label](/p`) never flashes
 * as raw punctuation while characters reveal.
 */
export function safePartialMarkdown(text) {
  let out = text;
  const link = out.lastIndexOf("[");
  if (link !== -1 && !/\[[^\]]*\]\([^)]*\)/.test(out.slice(link))) out = out.slice(0, link);
  if ((out.match(/\*\*/g) || []).length % 2 === 1) out = out.slice(0, out.lastIndexOf("**"));
  if ((out.match(/`/g) || []).length % 2 === 1) out = out.slice(0, out.lastIndexOf("`"));
  return out;
}

export default KuroMarkdown;

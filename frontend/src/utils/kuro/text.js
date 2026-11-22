/**
 * Text normalization and fuzzy helpers for Kuro's intent router.
 * Pure functions, no browser or React dependencies (also runs in the API bundle).
 */

const PRE_REPLACEMENTS = [
  [/next\.js/g, "nextjs"],
  [/node\.js/g, "nodejs"],
  [/react\.js/g, "react"],
  [/vue\.js/g, "vuejs"],
  [/three\.js/g, "threejs"],
  [/c\+\+/g, "cpp"],
  [/c#/g, "csharp"],
  [/ci\s*\/\s*cd/g, "cicd"],
  [/q\s*&\s*a/g, "qa"],
  [/e-mail/g, "email"],
  [/ctrl\s*\+\s*alt\s*\+\s*h/g, "ctrlalth"],
  [/ctrl\s*\+\s*k/g, "ctrlk"],
  [/\u20b9/g, " inr "],
  [/\$/g, " usd "],
  [/\brs\.?\s*(?=\d)/g, " inr "],
];

const CONTRACTIONS = [
  [/\bwhat's\b/g, "what is"],
  [/\bwho's\b/g, "who is"],
  [/\bhow's\b/g, "how is"],
  [/\bwhere's\b/g, "where is"],
  [/\bwhen's\b/g, "when is"],
  [/\bthat's\b/g, "that is"],
  [/\bit's\b/g, "it is"],
  [/\bthere's\b/g, "there is"],
  [/\blet's\b/g, "let us"],
  [/\bi'm\b/g, "i am"],
  [/\byou're\b/g, "you are"],
  [/\bhe's\b/g, "he is"],
  [/\bshe's\b/g, "she is"],
  [/\bthey're\b/g, "they are"],
  [/\bwe're\b/g, "we are"],
  [/\bcan't\b/g, "cannot"],
  [/\bwon't\b/g, "will not"],
  [/\bdon't\b/g, "do not"],
  [/\bdoesn't\b/g, "does not"],
  [/\bdidn't\b/g, "did not"],
  [/\bisn't\b/g, "is not"],
  [/\baren't\b/g, "are not"],
  [/\bi'd\b/g, "i would"],
  [/\bi'll\b/g, "i will"],
  [/\byou'll\b/g, "you will"],
  [/\bi've\b/g, "i have"],
  [/\byou've\b/g, "you have"],
];

/** Chat-speak and common typos mapped to a canonical token (may expand to several tokens). */
const TOKEN_MAP = {
  u: "you",
  ur: "your",
  r: "are",
  abt: "about",
  wat: "what",
  wats: "what is",
  whats: "what is",
  whos: "who is",
  hows: "how is",
  wheres: "where is",
  pls: "please",
  plz: "please",
  thx: "thanks",
  thnx: "thanks",
  thanx: "thanks",
  tnx: "thanks",
  tysm: "thanks",
  ty: "thanks",
  cya: "bye",
  byee: "bye",
  gn: "goodnight",
  yea: "yes",
  yeah: "yes",
  yep: "yes",
  yup: "yes",
  ya: "yes",
  nope: "no",
  nah: "no",
  okk: "ok",
  okay: "ok",
  avail: "available",
  rn: "right now",
  dev: "developer",
  devs: "developers",
  mail: "email",
  emailid: "email",
  cv: "resume",
  pricng: "pricing",
  prise: "price",
  hire: "hire",
  hiring: "hire",
  hired: "hire",
  techstack: "tech stack",
  portfolios: "portfolio",
};

export function normalize(input) {
  let s = String(input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u02bc`]/g, "'")
    .toLowerCase();
  for (const [re, to] of PRE_REPLACEMENTS) s = s.replace(re, to);
  for (const [re, to] of CONTRACTIONS) s = s.replace(re, to);
  s = s.replace(/'s\b/g, "").replace(/'/g, "");
  s = s.replace(/(.)\1{2,}/g, "$1$1");
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  const tokens = [];
  for (const raw of s.split(" ")) {
    if (!raw) continue;
    const mapped = TOKEN_MAP[raw];
    if (mapped) tokens.push(...mapped.split(" "));
    else tokens.push(raw);
  }
  return { text: tokens.join(" "), tokens };
}

/** Crude singularizer so plurals match ("skills" -> "skill", "ies" -> "y"). */
export function stem(token) {
  if (token.length > 4 && token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss") && !token.endsWith("us")) {
    return token.slice(0, -1);
  }
  return token;
}

/** Bounded Levenshtein distance; returns max + 1 when the distance exceeds `max`. */
export function editDistance(a, b, max = 2) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      cur[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Keyword equality: plural folding plus a typo allowance ("avalible", "resum").
 * Lenient on purpose; keywords are common words, so a near-miss is almost always a typo.
 */
export function tokenEq(a, b) {
  if (a === b) return true;
  const sa = stem(a);
  const sb = stem(b);
  if (sa === sb) return true;
  const min = Math.min(sa.length, sb.length);
  const max = Math.max(sa.length, sb.length);
  if (min < 5 || max < 6) return false;
  const allowed = min >= 8 ? 2 : 1;
  return editDistance(sa, sb, allowed) <= allowed;
}

/** Entity-name equality (projects, skills, pages): stricter so "clever" never matches "Clover". */
export function entityEq(a, b) {
  if (a === b) return true;
  const sa = stem(a);
  const sb = stem(b);
  if (sa === sb) return true;
  const min = Math.min(sa.length, sb.length);
  if (min < 7) return false;
  const allowed = min >= 9 ? 2 : 1;
  return editDistance(sa, sb, allowed) <= allowed;
}

const STOP = new Set(
  (
    "a an the and or but if of to in on at by for with from as is are was were be been am do does did " +
    "i me my you your yours he him his she her it its we us our they them their this that these those " +
    "there here what which who whom how when where why can could would should will shall may might must " +
    "have has had get got just so very really also about into over any some than then too up out " +
    "please tell show give me kuro hey hi hello ok yes no much many more long"
  ).split(" "),
);

export function isStop(token) {
  return STOP.has(token);
}

export function contentTokens(tokens) {
  return tokens.filter((t) => !STOP.has(t) && t.length > 1);
}

/**
 * Index of the first window of `phraseTokens` inside `tokens`, or -1.
 * `fuzzy`: true = entityEq (plurals + long-word typos), "stem" = plural folding only, false = exact.
 */
export function findSequence(tokens, phraseTokens, { fuzzy = true } = {}) {
  const n = phraseTokens.length;
  if (!n || tokens.length < n) return -1;
  const same =
    fuzzy === true
      ? entityEq
      : fuzzy === "stem"
        ? (a, b) => a === b || stem(a) === stem(b)
        : (a, b) => a === b;
  for (let i = 0; i <= tokens.length - n; i += 1) {
    let ok = true;
    for (let j = 0; j < n; j += 1) {
      const a = tokens[i + j];
      const b = phraseTokens[j];
      if (!same(a, b)) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
}

export function truncate(text, max = 220) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  if (lastStop > max * 0.55) return cut.slice(0, lastStop + 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max)}...`;
}

export function stripHtml(text) {
  return String(text ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function firstSentences(text, count = 2, max = 320) {
  const clean = stripHtml(text).replace(/\s+/g, " ");
  const parts = clean.match(/[^.!?]+[.!?]+(\s|$)/g) || [clean];
  return truncate(parts.slice(0, count).join(" ").trim(), max);
}

export function pick(list, seed) {
  if (!list.length) return "";
  const index =
    typeof seed === "number" ? Math.abs(seed) % list.length : Math.floor(Math.random() * list.length);
  return list[index];
}

export function plural(count, one, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export function joinList(items, conjunction = "and") {
  const list = items.filter(Boolean);
  if (list.length <= 1) return list.join("");
  if (list.length === 2) return `${list[0]} ${conjunction} ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, ${conjunction} ${list[list.length - 1]}`;
}

import { projects } from "../src/data/projects.js";

const MAX_REDIRECTS = 4;

function previewHosts() {
  const hosts = new Set();
  for (const project of projects) {
    const raw = project.links?.preview;
    if (!raw) continue;
    try {
      const host = new URL(raw).hostname.toLowerCase();
      hosts.add(host);
      hosts.add(host.replace(/^www\./, ""));
    } catch {
      /* skip bad project urls */
    }
  }
  return hosts;
}

function parseTarget(raw) {
  if (!raw || typeof raw !== "string" || raw.length > 500) return null;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase();
  if (!previewHosts().has(host) && !previewHosts().has(host.replace(/^www\./, ""))) return null;
  return parsed;
}

function framingAllowsEmbed(headers) {
  const csp = String(headers.get("content-security-policy") || "");
  const match = csp.match(/frame-ancestors\s+([^;]+)/i);
  if (match) {
    const sources = match[1].trim().toLowerCase();
    if (!sources || sources === "'none'" || sources === "none") return false;
    if (sources.includes("*")) return true;
    return (
      sources.includes("aryandani.com") ||
      sources.includes("localhost") ||
      sources.includes("127.0.0.1")
    );
  }

  const xfo = String(headers.get("x-frame-options") || "").toLowerCase();
  if (xfo.includes("deny") || xfo.includes("sameorigin")) return false;

  return true;
}

async function fetchFinal(startUrl) {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: { Accept: "text/html,*/*;q=0.8" },
      signal: AbortSignal.timeout(6000),
    });
    await response.body?.cancel?.();

    const status = response.status;
    if (status < 300 || status >= 400) return response;

    const location = response.headers.get("location");
    if (!location) return response;
    const next = parseTarget(new URL(location, current).toString());
    if (!next) return response;
    current = next.toString();
  }
  return null;
}

export async function handleFrameCheckRequest(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const fromQuery =
    request.query?.url ||
    (() => {
      try {
        return new URL(request.url || "", "http://localhost").searchParams.get("url");
      } catch {
        return null;
      }
    })();

  const target = parseTarget(fromQuery);
  if (!target) {
    return response.status(400).json({ embeddable: false, error: "URL is not a project preview." });
  }

  try {
    const result = await fetchFinal(target.toString());
    if (!result) {
      return response.status(200).json({ embeddable: true, url: target.toString() });
    }
    const embeddable = framingAllowsEmbed(result.headers);
    response.setHeader("Cache-Control", "public, max-age=300");
    return response.status(200).json({
      embeddable,
      url: target.toString(),
    });
  } catch {
    return response.status(200).json({ embeddable: true, url: target.toString() });
  }
}

export default async function handler(request, response) {
  return handleFrameCheckRequest(request, response);
}

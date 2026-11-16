import { FaEye, FaFileDownload } from "react-icons/fa";
import { aboutInfo, resumeVersions } from "../../data/experience";
import { getAssetPath } from "../../utils/paths";

/**
 * Dual Classic + LaTeX resume controls used on About / Contact / Services.
 * `onView(versionId)` opens the shared ResumeModal on that version.
 */
export default function ResumeActions({
  onView,
  tone = "inverted", // inverted = on dark CTA panels; surface = on light panels
  layout = "stack", // "stack" (default) or "grid"
}) {
  const versions = aboutInfo.resumes || resumeVersions;
  const isInverted = tone === "inverted";

  const btnBase =
    "px-3 py-2.5 font-label-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer select-none rounded-none";

  const btnView = isInverted
    ? `${btnBase} bg-white text-black border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.35)] hover:bg-yellow-400 hover:text-black hover:border-yellow-400 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`
    : `${btnBase} bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-2 border-outline shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`;

  const btnDownload = isInverted
    ? `${btnBase} bg-transparent text-white border-2 border-white/70 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:bg-white hover:text-black hover:border-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`
    : `${btnBase} bg-[var(--color-surface)] text-[var(--color-on-surface)] border-2 border-outline shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`;

  const containerClass =
    layout === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 gap-3.5"
      : "flex flex-col gap-3.5";

  return (
    <div className={containerClass}>
      {versions.map((version) => (
        <div
          key={version.id}
          className={`border-2 p-3.5 flex flex-col gap-3 transition-colors ${
            isInverted
              ? "border-white/25 bg-white/[0.04] hover:border-white/50"
              : "border-outline bg-[var(--color-surface)] hover:border-current"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-label-bold text-xs uppercase tracking-wider px-2 py-0.5 border ${
                isInverted
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-outline bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]"
              }`}
            >
              {version.shortLabel}
            </span>
            <span
              className={`font-body-md text-xs ${
                isInverted ? "text-white/70" : "text-[var(--color-on-surface-variant)]"
              }`}
            >
              {version.blurb}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onView?.(version.id)}
              className={btnView}
              aria-label={`View ${version.shortLabel} in browser`}
            >
              <FaEye className="text-sm shrink-0" aria-hidden />
              <span>View</span>
            </button>
            <a
              href={getAssetPath(version.url)}
              download={version.downloadName}
              className={btnDownload}
              aria-label={`Download ${version.shortLabel}`}
            >
              <FaFileDownload className="text-sm shrink-0" aria-hidden />
              <span>Download</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

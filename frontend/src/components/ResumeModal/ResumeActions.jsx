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
    "px-3 py-2.5 font-label-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-none select-none";

  const btnView = isInverted
    ? `${btnBase} bg-[var(--color-background)] text-[var(--color-on-background)] border-2 border-current shadow-[2px_2px_0px_0px_currentColor] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none hover:bg-white`
    : `${btnBase} bg-[var(--color-primary)] text-[var(--color-on-primary)] border-2 border-outline shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`;

  const btnDownload = isInverted
    ? `${btnBase} bg-transparent text-current border-2 border-current shadow-[2px_2px_0px_0px_currentColor] hover:bg-[var(--color-background)] hover:text-[var(--color-on-background)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`
    : `${btnBase} bg-transparent text-[var(--color-on-surface)] border-2 border-outline shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`;

  const containerClass =
    layout === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 gap-3"
      : "flex flex-col gap-3";

  return (
    <div className={containerClass}>
      {versions.map((version) => (
        <div
          key={version.id}
          className={`border-2 p-3.5 flex flex-col gap-2.5 transition-colors ${
            isInverted
              ? "border-current/30 bg-white/[0.04] hover:border-current/60"
              : "border-outline bg-[var(--color-surface)] hover:border-current"
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-label-bold text-xs uppercase tracking-wider px-2 py-0.5 border border-current/40 bg-current/10">
              {version.shortLabel}
            </span>
            <span className="font-body-md text-xs opacity-75">
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

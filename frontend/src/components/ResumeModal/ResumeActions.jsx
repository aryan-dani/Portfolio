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
    "px-3 py-2.5 font-label-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer select-none rounded-none";

  // Inverted CTA panels set color: var(--color-background). Use theme tokens so both
  // light-mode (dark panel) and dark-mode (light panel) stay readable.
  const btnView = isInverted
    ? `${btnBase} bg-[var(--color-background)] text-[var(--color-on-background)] border-2 border-[var(--color-background)] shadow-[3px_3px_0px_0px_color-mix(in_srgb,var(--color-background)_35%,transparent)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`
    : `${btnBase} bg-primary-container text-on-primary-container border-2 border-outline shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`;

  const btnDownload = isInverted
    ? `${btnBase} bg-transparent text-[var(--color-background)] border-2 border-[color-mix(in_srgb,var(--color-background)_70%,transparent)] shadow-[3px_3px_0px_0px_color-mix(in_srgb,var(--color-background)_20%,transparent)] hover:bg-[var(--color-background)] hover:text-[var(--color-on-background)] hover:border-[var(--color-background)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`
    : `${btnBase} bg-surface text-on-surface border-2 border-outline shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:bg-primary-container hover:text-on-primary-container hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`;

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
              ? "border-[color-mix(in_srgb,var(--color-background)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-background)_6%,transparent)] hover:border-[color-mix(in_srgb,var(--color-background)_55%,transparent)]"
              : "border-outline bg-surface hover:border-current"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-label-bold text-xs tracking-wider px-2 py-0.5 border ${
                isInverted
                  ? "border-[color-mix(in_srgb,var(--color-background)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-background)_10%,transparent)] text-[var(--color-background)]"
                  : "border-outline bg-surface-variant text-on-surface"
              }`}
            >
              {version.shortLabel}
            </span>
            <span
              className={`font-body-md text-xs ${
                isInverted
                  ? "text-[color-mix(in_srgb,var(--color-background)_75%,transparent)]"
                  : "text-on-surface-variant"
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

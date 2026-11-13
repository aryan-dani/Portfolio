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
}) {
  const versions = aboutInfo.resumes || resumeVersions;
  const isInverted = tone === "inverted";

  const btn =
    isInverted
      ? "bg-transparent text-[var(--color-background)] border-4 border-current shadow-[4px_4px_0px_0px_var(--color-background)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
      : "bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {versions.map((version) => (
        <div
          key={version.id}
          className={`border-2 border-current/40 p-3 flex flex-col gap-2 ${
            isInverted ? "border-current/50" : "border-outline"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-label-bold text-xs uppercase tracking-wider">
              {version.shortLabel}
            </span>
            <span className="font-body-md text-[10px] sm:text-xs opacity-60 truncate">
              {version.blurb}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onView?.(version.id)}
              className={`${btn} px-2 py-2.5 font-label-bold text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-none`}
            >
              <FaEye className="text-sm sm:text-base text-current" aria-hidden />
              <span>View</span>
            </button>
            <a
              href={getAssetPath(version.url)}
              download={version.downloadName}
              className={`${btn} px-2 py-2.5 font-label-bold text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1.5 transition-all w-full cursor-none`}
            >
              <FaFileDownload className="text-sm sm:text-base text-current" aria-hidden />
              <span>Download</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

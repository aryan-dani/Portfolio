import { motion, AnimatePresence } from "framer-motion";
import { useModalLock } from "../../hooks/useModalLock";
import { modalBackdropVariants, modalContentVariants } from "../../utils/motionVariants";
import { FaFileDownload, FaTimes } from "react-icons/fa";
import { aboutInfo } from "../../data/experience";
import { getAssetPath } from "../../utils/paths";

export default function ResumeModal({ isOpen, onClose }) {
  useModalLock(isOpen, onClose);

  const resumePath = getAssetPath(aboutInfo.resumeUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 gpu-layer">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl h-[85vh] bg-[var(--color-surface)] border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col z-10 overflow-hidden paint-isolate"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-viewer-title"
          >
            {/* Header */}
            <div className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-b-4 border-outline px-4 py-3 flex items-center justify-between">
              <span id="resume-viewer-title" className="font-headline-md text-sm md:text-base uppercase tracking-wider">
                DOCUMENT_VIEWER.EXE // RESUME.PDF
              </span>
              <div className="flex items-center gap-3">
                {/* Download Option */}
                <a
                  href={resumePath}
                  download="Aryan_Dani_Resume.pdf"
                  aria-label="Download Aryan Dani resume PDF"
                  className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-2 border-outline px-3 py-1 font-label-bold text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-none"
                >
                  <FaFileDownload />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="bg-[var(--color-error)] text-[var(--color-on-error)] border-2 border-outline p-1.5 hover:bg-red-600 transition-colors flex items-center justify-center cursor-none"
                  aria-label="Close viewer"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>

            {/* Scrollable Wrapper with pointer-events-none on Iframe to preserve custom cursor */}
            <div className="grow w-full overflow-y-auto overscroll-contain bg-[var(--color-surface-variant)] p-4 md:p-6 no-scrollbar content-visibility-auto" data-lenis-prevent>
              <div className="w-full max-w-3xl mx-auto border-4 border-outline shadow-[6px_6px_0px_0px_var(--shadow-color)] pointer-events-none select-none bg-white">
                <iframe
                  src={`${resumePath}#toolbar=0&navpanes=0`}
                  title="Resume PDF Viewer"
                  className="w-full h-[1150px] md:h-[1200px] border-0"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

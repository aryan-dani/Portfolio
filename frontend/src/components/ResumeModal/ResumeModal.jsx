import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFileDownload, FaTimes } from "react-icons/fa";
import { aboutInfo } from "../../data/experience";
import { getAssetPath } from "../../utils/paths";

export default function ResumeModal({ isOpen, onClose }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const resumePath = getAssetPath(aboutInfo.resumeUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Window Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-4xl h-[85vh] bg-[var(--color-surface)] border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-b-4 border-outline px-4 py-3 flex items-center justify-between">
              <span className="font-headline-md text-sm md:text-base uppercase tracking-wider">
                DOCUMENT_VIEWER.EXE // RESUME.PDF
              </span>
              <div className="flex items-center gap-3">
                {/* Download Option */}
                <a
                  href={resumePath}
                  download="Aryan_Dani_Resume.pdf"
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

            {/* Native Iframe PDF Viewer */}
            <div className="grow w-full bg-[var(--color-surface-variant)] relative">
              <iframe
                src={`${resumePath}#toolbar=0`}
                title="Resume PDF Viewer"
                className="w-full h-full border-0"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

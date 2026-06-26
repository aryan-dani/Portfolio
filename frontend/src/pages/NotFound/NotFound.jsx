import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageSEO } from "../../utils/seo";

export default function NotFound() {
  usePageSEO(undefined, "/404");

  return (
    <motion.section
      className="flex min-h-[60vh] flex-col items-start justify-center gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="border-4 border-outline bg-[var(--color-primary-container)] px-6 py-4 text-[var(--color-on-primary-container)] shadow-[8px_8px_0_var(--shadow-color)]">
        <h1 className="font-headline-xl text-5xl uppercase md:text-7xl">404</h1>
      </div>
      <div className="max-w-2xl border-4 border-outline bg-[var(--color-surface)] p-6 shadow-[6px_6px_0_var(--shadow-color)]">
        <h2 className="font-headline-md text-3xl uppercase text-[var(--color-on-surface)]">
          Page Not Found
        </h2>
        <p className="mt-4 font-body-lg text-[var(--color-on-surface)]">
          This page does not exist, but Aryan Dani&apos;s AI engineering, machine learning,
          full-stack development, and portfolio projects are still one click away.
        </p>
      </div>
      <nav aria-label="Helpful portfolio links" className="flex flex-wrap gap-3">
        {[
          ["/", "Return to Aryan Dani home"],
          ["/projects", "Explore AI and web development projects"],
          ["/skills", "Review technical skills"],
          ["/contact", "Contact Aryan Dani"],
        ].map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className="border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            {label}
          </Link>
        ))}
      </nav>
    </motion.section>
  );
}

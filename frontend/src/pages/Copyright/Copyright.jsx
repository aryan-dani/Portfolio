import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaArrowLeft,
  FaBalanceScale,
} from "react-icons/fa";

import { containerVariants, itemVariants } from "../../utils/motionVariants";

function Copyright() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.section
      className="flex flex-col gap-12 w-full pb-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="mb-8 border-b-8 border-outline pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mt-4 bg-hatch p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
        <div className="flex flex-col gap-6">
          <motion.div
            variants={itemVariants}
            className="bg-[var(--color-primary-container)] border-4 border-outline px-6 py-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] transition-transform flex items-center gap-4 w-fit"
          >
            <FaBalanceScale className="text-4xl text-[var(--color-on-primary-container)]" />
            <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-[var(--color-on-primary-container)] uppercase tracking-tighter">
              COPYRIGHT
            </h1>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="font-body-lg text-base md:text-lg lg:text-body-lg text-[var(--color-on-surface)] max-w-2xl bg-[var(--color-surface)] border-4 border-outline p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
          >
            MIT License. Open source portfolio template.
          </motion.p>
        </div>
      </header>

      <div className="w-full">
        <motion.div className="mb-12" variants={itemVariants}>
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline px-6 py-3 font-label-bold text-lg uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:bg-[var(--color-on-background)] hover:text-[var(--color-background)] transition-all cursor-none"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        <motion.div className="flex flex-col gap-8" variants={itemVariants}>
          <motion.div
            className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col items-start gap-4"
            variants={itemVariants}
          >
            <h2 className="font-headline-md text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              MIT License
            </h2>
            <p className="font-label-bold text-xl bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-2 border-outline w-fit px-4 py-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              Copyright © {currentYear} Aryan Hardik Dani
            </p>

            <div className="font-body-md text-base md:text-lg space-y-6 mt-4">
              <p>
                Permission is hereby granted, free of charge, to any person
                obtaining a copy of this software and associated documentation
                files (the "Software"), to deal in the Software without
                restriction, including without limitation the rights to use,
                copy, modify, merge, publish, distribute, sublicense, and/or
                sell copies of the Software, and to permit persons to whom the
                Software is furnished to do so, subject to the following
                conditions:
              </p>

              <p>
                The above copyright notice and this permission notice shall be
                included in all copies or substantial portions of the Software.
              </p>

              <p className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline p-6 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] mt-8">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
                NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
                HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
                FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
                OTHER DEALINGS IN THE SOFTWARE.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col items-start gap-4"
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-3xl uppercase border-b-4 border-outline pb-2 w-fit text-[var(--color-on-surface)]">
              Attribution
            </h3>
            <p className="font-body-md text-lg text-[var(--color-on-surface-variant)]">
              This portfolio is designed and developed by{" "}
              <strong className="text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] px-2 border-2 border-outline shadow-[2px_2px_0px_0px_var(--shadow-color)] font-black">
                Aryan Dani
              </strong>
            </p>
          </motion.div>

          <motion.div
            className="bg-[var(--color-surface-variant)] border-4 border-outline p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-3xl uppercase mb-6 text-[var(--color-on-surface)]">
              Get in Touch
            </h3>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/aryan-dani"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline px-6 py-3 font-label-bold text-base uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-none"
              >
                <FaGithub className="text-xl" />
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/aryandani"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[var(--color-secondary)] text-[var(--color-on-secondary)] border-4 border-outline px-6 py-3 font-label-bold text-base uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-none"
              >
                <FaLinkedin className="text-xl" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:daniaryan212@gmail.com"
                className="flex items-center gap-3 bg-[var(--color-on-background)] text-[var(--color-background)] border-4 border-outline px-6 py-3 font-label-bold text-base uppercase shadow-[4px_4px_0px_0px_var(--shadow-accent)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-none"
              >
                <FaEnvelope className="text-xl" />
                <span>Email</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Copyright;

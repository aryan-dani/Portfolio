import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaArrowLeft,
  FaBalanceScale,
} from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function Copyright() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.section
      className="flex flex-col gap-12 w-full pb-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="mb-8 border-b-8 border-black pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mt-4">
        <div className="flex flex-col gap-6">
          <motion.div
            variants={itemVariants}
            className="bg-primary-container border-4 border-black px-6 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform flex items-center gap-4 w-fit"
          >
            <FaBalanceScale className="text-4xl" />
            <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-black uppercase tracking-tighter">
              COPYRIGHT
            </h1>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="font-body-lg text-base md:text-lg lg:text-body-lg text-black max-w-2xl bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            MIT License. Open source portfolio template.
          </motion.p>
        </div>
      </header>

      <div className="w-full">
        <motion.div className="mb-12" variants={itemVariants}>
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-white border-4 border-black px-6 py-3 font-label-bold text-lg uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:bg-black hover:text-white transition-all"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        <motion.div className="flex flex-col gap-8" variants={itemVariants}>
          <motion.div
            className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-start gap-4"
            variants={itemVariants}
          >
            <h2 className="font-headline-md text-3xl uppercase border-b-4 border-black pb-2 w-fit">
              MIT License
            </h2>
            <p className="font-label-bold text-xl bg-surface-variant border-2 border-black w-fit px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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

              <p className="bg-primary-container border-4 border-black p-6 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-8">
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
            className="bg-black text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(240,255,0,1)] flex flex-col items-start gap-4"
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-3xl uppercase border-b-4 border-white pb-2 text-primary-container w-fit">
              Attribution
            </h3>
            <p className="font-body-md text-lg">
              This portfolio was designed and developed by{" "}
              <strong className="text-secondary bg-white px-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(240,255,0,1)]">
                Aryan Dani
              </strong>
              .
            </p>
          </motion.div>

          <motion.div
            className="bg-surface-variant border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-3xl uppercase mb-6">
              Get in Touch
            </h3>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/aryan-dani"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white text-black border-4 border-black px-6 py-3 font-label-bold text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              >
                <FaGithub className="text-xl" />
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/aryandani"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-secondary text-white border-4 border-black px-6 py-3 font-label-bold text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              >
                <FaLinkedin className="text-xl" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:daniaryan212@gmail.com"
                className="flex items-center gap-3 bg-black text-white border-4 border-black px-6 py-3 font-label-bold text-base uppercase shadow-[4px_4px_0px_0px_rgba(240,255,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              >
                <FaEnvelope className="text-xl text-primary-container" />
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
